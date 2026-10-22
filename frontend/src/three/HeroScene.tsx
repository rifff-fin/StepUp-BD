import { Suspense, useEffect, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Shadow } from '@react-three/drei';
import * as THREE from 'three';
import { Shoe } from './Shoe';
import { Studio } from './Studio';
import { useDragSpin } from './useDragSpin';
import { SHOE_HEIGHT } from './shoeGeometry';
import type { Palette } from '../types';

interface Props {
  palette: Palette;
  /** False while the hero is off screen: rendering pauses. */
  active: boolean;
  reduced: boolean;
  heroRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  /** The GPU dropped the WebGL context (e.g. a phone under memory pressure). */
  onContextLost: () => void;
}

const FOV = 30;
const BASE_ANGLE = -0.55; // a three-quarter view to start with

/**
 * The hero's 3D stage (lazy chunk). Motion layers, outermost first:
 *   float  – slow bob up and down
 *   tilt   – leans towards the mouse (parallax)
 *   spin   – auto-rotation + drag with inertia + rotation tied to scrolling the hero
 * The camera also dollies in as the hero scrolls away.
 */
export default function HeroScene({
  palette,
  active,
  reduced,
  heroRef,
  onReady,
  onContextLost,
}: Props) {
  return (
    <Canvas
      dpr={[1, 2]} // pixel ratio capped at 2 for mid-range phones
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: FOV, position: [0, 0.8, 7], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onContextLost, { once: true });
      }}
      aria-hidden="true"
    >
      <Studio />
      <Suspense fallback={null}>
        <Rig palette={palette} reduced={reduced} heroRef={heroRef} />
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
  palette,
  reduced,
  heroRef,
}: {
  palette: Palette;
  reduced: boolean;
  heroRef: RefObject<HTMLElement | null>;
}) {
  const rig = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null);
  const pointer = useRef({ x: 0, y: 0 });
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

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const { damp } = THREE.MathUtils;

    // 0 at the top of the page, 1 once the hero has scrolled away
    const hero = heroRef.current;
    const progress = hero
      ? THREE.MathUtils.clamp(window.scrollY / (hero.offsetHeight * 0.9), 0, 1)
      : 0;

    if (spin.current) {
      const angle = stepSpin(delta, reduced ? 0 : 0.32);
      spin.current.rotation.y = BASE_ANGLE + angle + progress * Math.PI * 0.9;
    }

    if (rig.current) rig.current.position.y = -progress * 0.25;
    if (float.current) {
      const bob = reduced ? 0 : Math.sin(time * 1.25) * 0.09;
      float.current.position.y = bob;
      if (shadow.current) {
        const s = 1 - bob * 1.2;
        shadow.current.scale.set(4.2 * s, 1.6 * s, 1);
        shadow.current.material.opacity = 0.55 - bob * 1.5;
      }
    }

    if (tilt.current) {
      const px = reduced ? 0 : pointer.current.x;
      const py = reduced ? 0 : pointer.current.y;
      tilt.current.rotation.x = damp(tilt.current.rotation.x, 0.12 + py * 0.16, 4, delta);
      tilt.current.rotation.z = damp(tilt.current.rotation.z, -px * 0.08, 4, delta);
      tilt.current.position.x = damp(tilt.current.position.x, px * 0.15, 4, delta);
    }

    // Fit the shoe to the stage width (portrait phones need the camera further back),
    // then dolly in as the hero scrolls
    const { camera, size } = state;
    const aspect = size.width / Math.max(1, size.height);
    const fitWidth = 3.7 / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect);
    const distance = Math.max(5.6, fitWidth) * (1 - 0.22 * progress);
    camera.position.z = damp(camera.position.z, distance, 5, delta);
    camera.position.y = damp(camera.position.y, 0.8 - progress * 0.4, 5, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={rig}>
      <group ref={float}>
        <group ref={tilt}>
          <group ref={spin}>
            {/* stand the shoe on the floor and centre it */}
            <group position={[0, -SHOE_HEIGHT / 2, 0]}>
              <Shoe palette={palette} />
            </group>
          </group>
        </group>
      </group>
      <Shadow
        ref={shadow}
        position={[0, -SHOE_HEIGHT / 2 - 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#000"
        colorStop={0}
        opacity={0.55}
        fog={false}
      />
    </group>
  );
}
