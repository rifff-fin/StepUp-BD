import { Environment, Lightformer } from '@react-three/drei';

/**
 * Product-shoot lighting for the dark stage: a low ambient (so the shoe has contrast), a
 * warm-white key, strong bronze rims from behind that trace the shoe's edges and stitching,
 * a fill, and an environment map rendered once from light panels (no HDR download) for the
 * sheen on the leather and the glossy pedestal.
 */
export function Studio() {
  return (
    <>
      <hemisphereLight args={['#ffeedd', '#120e0c', 0.34]} />
      {/* key: warm white from the top-front, matching the photo's spotlight */}
      <directionalLight position={[2, 7, 5]} intensity={2.2} color="#ffe6cc" />
      {/* bronze rims from behind trace the shoe against the dark set */}
      <directionalLight position={[-5, 3, -4]} intensity={3.4} color="#e0a585" />
      <directionalLight position={[4, 2, -5]} intensity={2.6} color="#ffc08f" />
      {/* the pedestal's glow in the photo, warming the sole from below */}
      <directionalLight position={[0, -4, 1.5]} intensity={1.6} color="#e8a878" />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#ffe2c6"
          position={[0, 5, 2]}
          scale={[6, 2, 1]}
        />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} scale={[2, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#c48a62"
          position={[5, 0.5, -2]}
          scale={[2, 5, 1]}
        />
        <Lightformer form="ring" intensity={1.2} color="#f0c9a6" position={[0, -2, 4]} scale={3} />
      </Environment>
    </>
  );
}
