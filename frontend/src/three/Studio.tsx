import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting: a warm-white key, a red rim from behind, a soft fill, and an environment
 * map rendered once from light panels (no HDR download) for reflections on the leather.
 */
export function Studio() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#2a0000', 0.55]} />
      <directionalLight position={[4, 6, 5]} intensity={2.3} />
      <directionalLight position={[-5, 3, -4]} intensity={3.2} color="#ff3b2f" />
      <directionalLight position={[2, 2.5, -6]} intensity={1.1} />
      <directionalLight position={[0, -4, 2]} intensity={0.5} color="#e10600" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} scale={[2, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ff2a1a"
          position={[5, 0.5, -2]}
          scale={[2, 5, 1]}
        />
        <Lightformer form="ring" intensity={1.5} position={[0, 1, 6]} scale={3} />
      </Environment>
    </>
  );
}
