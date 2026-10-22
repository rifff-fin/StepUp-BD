import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Shoe } from './Shoe';
import { Studio } from './Studio';
import { useDragSpin } from './useDragSpin';
import { SHOE_HEIGHT } from './shoeGeometry';
import { isReducedMotion } from '../lib/motion';
import { HERO_COLORWAYS, type Colorway } from './colorways';

/**
 * The quick view's small 3D viewer (lazy chunk, shares the shoe geometry with the hero).
 * It only exists while the quick view is open, so it never renders in the background.
 */
export default function MiniViewer({ colorway = HERO_COLORWAYS[0] }: { colorway?: Colorway }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 1.6, 8], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Studio />
      <Suspense fallback={null}>
        <Turntable colorway={colorway} />
      </Suspense>
    </Canvas>
  );
}

function Turntable({ colorway }: { colorway: Colorway }) {
  const spin = useRef<THREE.Group>(null);
  const stepSpin = useDragSpin();

  useFrame((state, delta) => {
    if (spin.current) {
      spin.current.rotation.y = -0.6 + stepSpin(Math.min(delta, 0.05), isReducedMotion() ? 0 : 0.6);
    }
    // Fit the shoe to the box: the small corner viewer and the expanded one
    const { camera, size } = state;
    const aspect = Math.min(size.width / Math.max(1, size.height), 1.6);
    const distance = 3.9 / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * aspect);
    camera.position.set(0, distance * 0.2, distance);
    camera.lookAt(0, -0.1, 0);
  });

  return (
    <group ref={spin} rotation={[0, -0.6, 0]}>
      <group position={[0, -SHOE_HEIGHT / 2, 0]}>
        <Shoe colorway={colorway} />
      </group>
    </group>
  );
}
