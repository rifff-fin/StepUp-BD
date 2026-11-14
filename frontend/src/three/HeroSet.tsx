import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/**
 * The 3D extras over the hero's photographic set (`/hero/stage-*.webp`, a lit pedestal with
 * a halo, rocks and smoke): a tilted ring of light around the shoe and drifting bronze dust.
 * `weight` (1 in the hero, 0 in the story) fades the ring away so the story shows the shoe
 * alone.
 */

const BRONZE = new THREE.Color('#e9b98e');
const EMBER = new THREE.Color('#c88a5c');

/** A thin torus whose light runs round it in two streaks (additive, depth-tested). */
function ringMaterial(color: THREE.Color, base: number, opacity: number) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: opacity }, uColor: { value: color } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float p = fract(vUv.x - uTime * 0.035);
        float s1 = exp(-pow((p - 0.5) * 7.0, 2.0));
        float q = fract(p + 0.5);
        float s2 = 0.55 * exp(-pow((q - 0.5) * 9.0, 2.0));
        float streak = s1 + s2;
        float edge = sin(vUv.y * 3.14159);
        float a = (${base.toFixed(2)} + streak) * edge * uOpacity;
        gl_FragColor = vec4(uColor * (0.7 + streak * 1.3) * a, a);
      }`,
  });
  material.userData.base = opacity;
  return material;
}

/** A tilted ring of light around the shoe, with two streaks running round it. */
export function OrbitRing({ weight, reduced }: { weight: RefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(
    () => ({ line: ringMaterial(BRONZE, 0.42, 1), glow: ringMaterial(EMBER, 0.12, 0.6) }),
    [],
  );
  // Materials are reached through the scene graph (the memoised values stay untouched)
  useFrame((state) => {
    const root = group.current;
    if (!root) return;
    const w = weight.current ?? 1;
    root.visible = w > 0.01;
    if (!root.visible) return;
    const time = reduced ? 0 : state.clock.elapsedTime;
    root.traverse((child) => {
      const material = (child as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
      if (!material?.uniforms) return;
      material.uniforms.uOpacity.value = (material.userData.base as number) * w;
      material.uniforms.uTime.value = time;
    });
  });
  return (
    <group ref={group} rotation={[0, 0, 0.2]}>
      <group rotation={[1.16, 0, 0]}>
        <mesh material={mats.line}>
          <torusGeometry args={[2.35, 0.014, 8, 320]} />
        </mesh>
        <mesh material={mats.glow}>
          <torusGeometry args={[2.35, 0.07, 8, 320]} />
        </mesh>
      </group>
    </group>
  );
}

/** Bronze dust drifting through the light. */
export function Dust({ phone, reduced }: { phone: boolean; reduced: boolean }) {
  return (
    <Sparkles
      count={phone ? 14 : 36}
      scale={[9, 4.5, 3]}
      size={phone ? 2 : 2.6}
      speed={reduced ? 0 : 0.22}
      opacity={0.55}
      color="#e6b48a"
      noise={0.6}
    />
  );
}
