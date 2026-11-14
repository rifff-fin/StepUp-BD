import { Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, Shadow } from '@react-three/drei';
import * as THREE from 'three';
import { Shoe } from './Shoe';
import { Studio } from './Studio';
import { Dust, OrbitRing } from './HeroSet';
import { useDragSpin } from './useDragSpin';
import { SHOE_HEIGHT } from './shoeGeometry';
import { onRevealed } from '../lib/reveal';
import type { Colorway } from './colorways';

interface Props {
  colorway: Colorway;
  /** False while the story is off screen: rendering pauses. */
  active: boolean;
  reduced: boolean;
  /** The scroll-story wrapper: the shoe's pose follows the scroll through it. */
  storyRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  /** The GPU dropped the WebGL context (e.g. a phone under memory pressure). */
  onContextLost: () => void;
}

const FOV = 30;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
/** The hero's side: a clean side profile, toe pointing right, swoosh to the camera. */
const SIDE_ANGLE = 0.1;

/**
 * Where the shoe sits at each scroll stop (`s` = screens scrolled into the story).
 * x / y are fractions of the half-viewport (+x right, +y up); rotY / rotX in radians.
 * s = 0 is the hero (rotY is added to the idle spin there).
 */
interface Pose {
  x: number;
  y: number;
  scale: number;
  rotY: number;
  rotX: number;
  /** Roll: negative tips the toe down, like a shoe caught mid-float. */
  rotZ: number;
}

/*
 * Calibrated to the background photo (`/hero/stage-*.webp`): its pedestal is centred 62.3%
 * across and its top rim sits 72.2% down on desktop (`.stage-bg` anchors the photo there);
 * on phones the CSS puts it in the middle, 43% down. The shoe floats above it in the hero,
 * then settles onto it for the Wings view.
 */
const DESKTOP: Pose[] = [
  { x: 0.27, y: 0.1, scale: 0.58, rotY: SIDE_ANGLE, rotX: -0.1, rotZ: -0.16 }, // floating
  { x: 0.246, y: -0.1, scale: 0.58, rotY: Math.PI - 0.85, rotX: 0.12, rotZ: 0 }, // on it: Wings
];

const PHONE: Pose[] = [
  { x: 0.02, y: 0.42, scale: 0.8, rotY: SIDE_ANGLE, rotX: -0.1, rotZ: -0.16 }, // floating
  { x: 0, y: 0.3, scale: 0.78, rotY: Math.PI - 0.85, rotX: 0.12, rotZ: 0 }, // on it: Wings
];

/** The photo's pedestal top (fractions of the half-viewport), for the shoe's shadow. */
const PEDESTAL = { desktop: { x: 0.246, y: -0.444 }, phone: { x: 0, y: 0.14 } };

export const STORY_STOPS = DESKTOP.length - 1;
/** Each story step is this many screens tall (keep in sync with `.story-step` in hero.css). */
const STEP_SCREENS = 0.8;

/**
 * Story progress (0 = hero pose, 1..STORY_STOPS = each step). The shoe turns over the first
 * half-screen of scrolling, finishing as the step reaches the middle of the screen, then
 * holds its pose while the step's copy settles in.
 */
function storyProgress(story: HTMLElement, vh: number) {
  const scrolled = -story.getBoundingClientRect().top;
  const steps = story.querySelector<HTMLElement>('.story-steps');
  const first = Math.max(1, (steps ? steps.offsetTop : vh) - vh * 0.5);
  const s = scrolled < first ? scrolled / first : 1 + (scrolled - first) / (vh * STEP_SCREENS);
  return THREE.MathUtils.clamp(s, 0, STORY_STOPS);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** An angle as a forward turn in [0, 2π). */
const forward = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

/**
 * The hero + scroll-story 3D stage (lazy chunk). The canvas is sticky behind the hero and
 * the story steps; the shoe glides between poses as the page scrolls, eased so it feels
 * like a scrubbed timeline. In the hero it floats over the background photo's lit pedestal
 * inside a ring of light (`HeroSet`), spins slowly, leans towards the mouse and can be
 * dragged; for the story it settles onto the pedestal. It spins up once it has loaded.
 */
export default function HeroScene({
  colorway,
  active,
  reduced,
  storyRef,
  onReady,
  onContextLost,
}: Props) {
  // Phones: a lower pixel ratio, no MSAA on dense screens, and the default GPU profile
  // (saves battery); if frames drop anywhere, the pixel ratio steps down to 1
  const [phone] = useState(
    () => window.matchMedia('(max-width: 899px), (pointer: coarse)').matches,
  );
  const [maxDpr, setMaxDpr] = useState(phone ? 1.5 : 2);
  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: FOV, position: [0, 0.6, 7], near: 0.1, far: 60 }}
      gl={{
        antialias: !phone || window.devicePixelRatio < 2,
        alpha: true,
        powerPreference: phone ? 'default' : 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.92; // a touch darker, to sit in the low-key photo
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true });
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
      <Studio />
      <Suspense fallback={null}>
        <Rig
          colorway={colorway}
          reduced={reduced}
          phone={phone}
          storyRef={storyRef}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}

function Rig({
  colorway,
  reduced,
  phone,
  storyRef,
  onReady,
}: {
  colorway: Colorway;
  reduced: boolean;
  phone: boolean;
  storyRef: RefObject<HTMLElement | null>;
  /** Called a frame after the shoe is visible in its colourway. */
  onReady: () => void;
}) {
  const rig = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null); // the shoe + its ring bob above the still pedestal
  const tilt = useRef<THREE.Group>(null);
  const heroWeightRef = useRef(1); // 1 in the hero, 0 in the story: fades the set
  const spin = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const intro = useRef<number | null>(null); // clock time the intro started
  const current = useRef<Pose | null>(null);
  const stepSpin = useDragSpin();

  // Mouse parallax: track the pointer over the whole window (desktop only)
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onMove = (event: PointerEvent) => {
      if (!fine.matches) return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // The intro spin starts once the page is revealed and the shoe is visible
  const revealedAt = useRef(false);
  useEffect(() => onRevealed(() => (revealedAt.current = true)), []);
  const shownAt = useRef<number | null>(null); // frames since the shoe became visible

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const { damp, clamp, lerp } = THREE.MathUtils;
    const { camera, size } = state;

    // Tell the page a frame after the shoe is drawn, so the canvas fades in with it
    if (shownAt.current !== null && shownAt.current < 2 && ++shownAt.current === 2) onReady();

    // Scroll: story steps scrolled past (0 = hero)
    const el = storyRef.current;
    const vh = window.innerHeight || 1;
    const s = el ? storyProgress(el, vh) : 0;

    const aspect = size.width / Math.max(1, size.height);
    const poses = aspect < 0.9 ? PHONE : DESKTOP;
    const i = Math.min(Math.floor(s), STORY_STOPS - 1);
    const t = easeInOut(s - i);
    const a = poses[i];
    const b = poses[i + 1];

    // In the hero the shoe holds its side profile with a gentle sway; a drag spins it and,
    // once let go, it settles back to the same side. The scroll then turns it forward to
    // the story pose (like a turntable), never back the short way round.
    const heroWeight = 1 - smooth(clamp(s, 0, 1));
    heroWeightRef.current = heroWeight;
    const drag = stepSpin(delta, 0, true);
    const sway = reduced ? 0 : Math.sin(time * 0.45) * 0.2 * heroWeight;
    let rotYa = a.rotY;
    if (i === 0) rotYa = b.rotY - forward(b.rotY - (a.rotY + drag + sway));
    const arc = Math.sin(Math.PI * t); // 0 → 1 → 0 across the move

    // Intro: rise from below, turning the last few degrees into the side profile (skipped
    // with reduced motion)
    if (intro.current === null && revealedAt.current && shownAt.current !== null) {
      intro.current = time;
    }
    const introT = reduced
      ? 1
      : intro.current === null
        ? 0
        : clamp((time - intro.current) / 1.8, 0, 1);
    const e = 1 - Math.pow(1 - introT, 3);

    const target: Pose = {
      x: lerp(a.x, b.x, t),
      // a gentle lift and push-in on the way, so the move reads as one designed arc
      y: lerp(a.y, b.y, t) + arc * 0.05 - (1 - e) * 0.9,
      scale: lerp(a.scale, b.scale, t) * (1 + arc * 0.03) * (0.72 + 0.28 * e),
      rotY: lerp(rotYa, b.rotY, t) - (1 - e) * 0.9,
      rotX: lerp(a.rotX, b.rotX, t),
      rotZ: lerp(a.rotZ, b.rotZ, t),
    };

    // Ease towards the target: a soft scrub (about GSAP's `scrub: 1`), so the shoe glides
    // after the scroll instead of snapping to it
    const c = (current.current ??= { ...target });
    const k = 3.2;
    if (Math.abs(target.rotY - c.rotY) > Math.PI)
      c.rotY += Math.sign(target.rotY - c.rotY) * Math.PI * 2;
    c.x = damp(c.x, target.x, k, delta);
    c.y = damp(c.y, target.y, k, delta);
    c.scale = damp(c.scale, target.scale, k, delta);
    c.rotY = damp(c.rotY, target.rotY, k, delta);
    c.rotX = damp(c.rotX, target.rotX, k, delta);
    c.rotZ = damp(c.rotZ, target.rotZ, k, delta);

    // Camera: fit the shoe's length to the viewport width
    const distance = Math.max(5.6, 3.9 / (2 * TAN * aspect));
    camera.position.set(0, 0.6, distance);
    camera.lookAt(0, 0, 0);
    const halfH = distance * TAN;
    const halfW = halfH * aspect;

    const bob = reduced ? 0 : Math.sin(time * 1.25) * 0.1 * heroWeight;
    if (rig.current) {
      rig.current.position.set(c.x * halfW, c.y * halfH, 0);
      rig.current.scale.setScalar(c.scale);
    }
    if (float.current) float.current.position.y = bob;
    if (spin.current) spin.current.rotation.y = c.rotY;
    if (tilt.current) {
      const px = reduced ? 0 : pointer.current.x * heroWeight;
      const py = reduced ? 0 : pointer.current.y * heroWeight;
      tilt.current.rotation.x = damp(tilt.current.rotation.x, c.rotX + py * 0.14, 4, delta);
      tilt.current.rotation.z = damp(tilt.current.rotation.z, c.rotZ - px * 0.07, 4, delta);
    }
    if (shadow.current) {
      // a soft shadow on the photo's pedestal: faint while the shoe floats above it,
      // firmer once it settles on it in the story
      const spot = aspect < 0.9 ? PEDESTAL.phone : PEDESTAL.desktop;
      shadow.current.position.set(spot.x * halfW, spot.y * halfH + 0.01, 0);
      const k2 = c.scale * (1 - bob * 1.5);
      shadow.current.scale.set(2.9 * k2, 0.5 * k2, 1);
      shadow.current.material.opacity = lerp(0.38, 0.62, 1 - heroWeight) * e * (1 - bob * 2);
    }
  });

  return (
    <>
      <Shadow
        ref={shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#000"
        colorStop={0}
        opacity={0.4}
        fog={false}
      />
      <group ref={rig}>
        <group ref={float}>
          <OrbitRing weight={heroWeightRef} reduced={reduced} />
          <group ref={tilt}>
            <group ref={spin}>
              {/* stand the shoe on the floor and centre it */}
              <group position={[0, -SHOE_HEIGHT / 2, 0]}>
                <Shoe
                  colorway={colorway}
                  onShown={() => {
                    shownAt.current ??= 0;
                  }}
                />
              </group>
            </group>
          </group>
        </group>
        <Dust phone={phone} reduced={reduced} />
      </group>
    </>
  );
}
