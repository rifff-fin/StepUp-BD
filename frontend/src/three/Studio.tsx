import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting: a warm-white key, a soft warm rim from behind, a fill, and an environment
 * map rendered once from light panels (no HDR download) for the sheen on the leather. The
 * only red is a low ember panel, so the shoe's own reds carry the colour; no neon rim.
 */
export function Studio() {
  return (
    <>
      <hemisphereLight args={['#fff8f0', '#1a1612', 0.6]} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} color="#fff4e8" />
      <directionalLight position={[-5, 3, -4]} intensity={2} color="#ffd8c2" />
      <directionalLight position={[2, 2.5, -6]} intensity={1.1} />
      <directionalLight position={[0, -4, 2]} intensity={0.3} color="#c8102e" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} scale={[2, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#c8102e"
          position={[5, 0.5, -2]}
          scale={[2, 5, 1]}
        />
        <Lightformer form="ring" intensity={1.5} position={[0, 1, 6]} scale={3} />
      </Environment>
    </>
  );
}
