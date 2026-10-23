import { Suspense, useEffect, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Shadow } from '@react-three/drei';
import * as THREE from 'three';
import { Shoe } from './Shoe';
import { Studio } from './Studio';
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
const BASE_ANGLE = -0.55; // a three-quarter view

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
}

const DESKTOP: Pose[] = [
  { x: 0.2, y: 0.22, scale: 0.66, rotY: BASE_ANGLE, rotX: 0.12 }, // hero, right of the copy
  { x: 0.42, y: 0.04, scale: 0.78, rotY: 0.02, rotX: 0.06 }, // side profile: leather
  { x: 0.4, y: 0.0, scale: 0.72, rotY: -1.05, rotX: 0.42 }, // toe box
  { x: 0.36, y: 0.04, scale: 0.74, rotY: Math.PI - 0.85, rotX: 0.12 }, // heel + Wings
  { x: 0.38, y: 0.04, scale: 0.8, rotY: -0.6, rotX: 0.16 }, // three-quarter, buy
];

const PHONE: Pose[] = [
  { x: 0, y: 0.26, scale: 0.92, rotY: BASE_ANGLE, rotX: 0.12 }, // between the tags and the copy
  { x: 0, y: 0.3, scale: 1, rotY: 0.02, rotX: 0.06 },
  { x: 0, y: 0.3, scale: 1, rotY: -1.05, rotX: 0.42 },
  { x: 0, y: 0.3, scale: 0.95, rotY: Math.PI - 0.85, rotX: 0.12 },
  { x: 0, y: 0.42, scale: 0.8, rotY: -0.6, rotX: 0.16 },
];

export const STORY_STOPS = DESKTOP.length - 1;

const smooth = (t: number) => t * t * (3 - 2 * t);
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a)); // to (-π, π]

/**
 * The hero + scroll-story 3D stage (lazy chunk). The canvas is sticky behind the hero and
 * the story steps; the shoe glides between poses as the page scrolls, eased so it feels
 * like a scrubbed timeline. In the hero it also spins slowly, floats, leans towards the
 * mouse and can be dragged. It plays an intro spin when the loader lifts.
 */
export default function HeroScene({
  colorway,
  active,
  reduced,
  storyRef,
  onReady,
  onContextLost,
}: Props) {
  return (
    <Canvas
      dpr={[1, 2]} // pixel ratio capped at 2 for mid-range phones
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: FOV, position: [0, 0.6, 7], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true });
      }}
      aria-hidden="true"
    >
      <Studio />
      <Suspense fallback={null}>
        <Rig colorway={colorway} reduced={reduced} storyRef={storyRef} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

/** Tells the page once the first frame with the shoe has been drawn. */
function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2) onReady();
  });
  return null;
}

function Rig({
  colorway,
  reduced,
  storyRef,
}: {
  colorway: Colorway;
  reduced: boolean;
  storyRef: RefObject<HTMLElement | null>;
}) {
  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
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

  // The intro spin starts when the loader lifts
  const revealedAt = useRef(false);
  useEffect(() => onRevealed(() => (revealedAt.current = true)), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const { damp, clamp, lerp } = THREE.MathUtils;
    const { camera, size } = state;

    // Scroll: screens scrolled into the story (0 = hero)
    const el = storyRef.current;
    const vh = window.innerHeight || 1;
    const s = el ? clamp(-el.getBoundingClientRect().top / vh, 0, STORY_STOPS) : 0;

    const aspect = size.width / Math.max(1, size.height);
    const poses = aspect < 0.9 ? PHONE : DESKTOP;
    const i = Math.min(Math.floor(s), STORY_STOPS - 1);
    const t = smooth(s - i);
    const a = poses[i];
    const b = poses[i + 1];

    // Idle spin (+ drag) only matters in the hero; it hands over to the story poses
    const heroWeight = 1 - smooth(clamp(s, 0, 1));
    const idle = stepSpin(delta, reduced ? 0 : 0.28 * heroWeight);
    let rotYa = a.rotY;
    if (i === 0) rotYa = b.rotY + wrapAngle(a.rotY + idle - b.rotY);

    // Intro: rise from below with one and a half turns (skipped with reduced motion)
    if (intro.current === null && revealedAt.current) intro.current = time;
    const introT = reduced
      ? 1
      : intro.current === null
        ? 0
        : clamp((time - intro.current) / 1.8, 0, 1);
    const e = 1 - Math.pow(1 - introT, 3);

    const target: Pose = {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t) - (1 - e) * 0.9,
      scale: lerp(a.scale, b.scale, t) * (0.72 + 0.28 * e),
      rotY: lerp(rotYa, b.rotY, t) + (1 - e) * Math.PI * 1.5,
      rotX: lerp(a.rotX, b.rotX, t),
    };

    // Ease towards the target: a smooth "scrub"
    const c = (current.current ??= { ...target });
    const k = 6;
    if (Math.abs(target.rotY - c.rotY) > Math.PI)
      c.rotY += Math.sign(target.rotY - c.rotY) * Math.PI * 2;
    c.x = damp(c.x, target.x, k, delta);
    c.y = damp(c.y, target.y, k, delta);
    c.scale = damp(c.scale, target.scale, k, delta);
    c.rotY = damp(c.rotY, target.rotY, k, delta);
    c.rotX = damp(c.rotX, target.rotX, k, delta);

    // Camera: fit the shoe's length to the viewport width
    const distance = Math.max(5.6, 3.9 / (2 * TAN * aspect));
    camera.position.set(0, 0.6, distance);
    camera.lookAt(0, 0, 0);
    const halfH = distance * TAN;
    const halfW = halfH * aspect;

    const bob = reduced ? 0 : Math.sin(time * 1.25) * 0.08 * heroWeight;
    if (rig.current) {
      rig.current.position.set(c.x * halfW, c.y * halfH + bob, 0);
      rig.current.scale.setScalar(c.scale);
    }
    if (spin.current) spin.current.rotation.y = c.rotY;
    if (tilt.current) {
      const px = reduced ? 0 : pointer.current.x * heroWeight;
      const py = reduced ? 0 : pointer.current.y * heroWeight;
      tilt.current.rotation.x = damp(tilt.current.rotation.x, c.rotX + py * 0.14, 4, delta);
      tilt.current.rotation.z = damp(tilt.current.rotation.z, -px * 0.07, 4, delta);
    }
    if (shadow.current) {
      // the floor shadow belongs to the hero; it fades as the shoe takes off
      const k2 = 1 - bob * 1.2;
      shadow.current.scale.set(4.2 * k2, 1.6 * k2, 1);
      shadow.current.material.opacity = (0.5 - bob * 1.5) * heroWeight * e;
    }
  });

  return (
    <group ref={rig}>
      <group ref={tilt}>
        <group ref={spin}>
          {/* stand the shoe on the floor and centre it */}
          <group position={[0, -SHOE_HEIGHT / 2, 0]}>
            <Shoe colorway={colorway} />
          </group>
        </group>
      </group>
      <Shadow
        ref={shadow}
        position={[0, -SHOE_HEIGHT / 2 - 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#000"
        colorStop={0}
        opacity={0.5}
        fog={false}
      />
    </group>
  );
}
