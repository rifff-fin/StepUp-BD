import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  COLOURWAY_FADE,
  GLB_COLOURWAY_MATERIAL,
  GLB_ROTATION_Y,
  LEATHER,
  SHOE_LENGTH,
} from './config';
import { isReducedMotion } from '../lib/motion';

/**
 * Lets a textured material cross-fade to another base-colour map: the shader mixes `map`
 * and `map2` by `uMix`, which eases 0 → 1, then `map2` becomes the new `map`.
 */
function blendableMap(material: THREE.MeshStandardMaterial) {
  const base = material.map!;
  const uniforms = { map2: { value: base as THREE.Texture }, uMix: { value: 0 } };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.map2 = uniforms.map2;
    shader.uniforms.uMix = uniforms.uMix;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_pars_fragment>',
        '#include <map_pars_fragment>\nuniform sampler2D map2;\nuniform float uMix;',
      )
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
  vec4 sampledDiffuseColor = mix(texture2D(map, vMapUv), texture2D(map2, vMapUv), uMix);
  diffuseColor *= sampledDiffuseColor;
#endif`,
      );
  };
  material.customProgramCacheKey = () => 'stepup-colourway-blend';

  const loader = new THREE.TextureLoader();
  const cache = new Map<string | null, Promise<THREE.Texture>>([[null, Promise.resolve(base)]]);
  const load = (url: string | null) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        loader.loadAsync(url!).then((tex) => {
          // match the glTF texture conventions
          tex.flipY = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = base.anisotropy;
          return tex;
        }),
      );
    }
    return cache.get(url)!;
  };

  let progress = 1;
  let wanted: string | null = null;
  return {
    setTarget(url: string | null) {
      wanted = url;
      void load(url).then((tex) => {
        if (wanted !== url || tex === material.map) return;
        if (progress < 1) material.map = uniforms.map2.value; // finish the previous fade
        uniforms.map2.value = tex;
        progress = isReducedMotion() ? 1 - 1e-6 : 0;
      });
    },
    update(delta: number) {
      if (progress >= 1) return;
      progress = Math.min(1, progress + delta / COLOURWAY_FADE);
      uniforms.uMix.value = progress * progress * (3 - 2 * progress);
      if (progress >= 1) {
        material.map = uniforms.map2.value;
        uniforms.uMix.value = 0;
      }
    },
    async dispose() {
      for (const [url, tex] of cache) if (url) (await tex).dispose();
    },
  };
}

/**
 * A real .glb shoe: cloned per scene, given a leather finish, scaled to SHOE_LENGTH, stood
 * on y = 0 and centred. `texture` switches the colourway (null = the map in the file).
 */
export function GltfShoe({ url, texture }: { url: string; texture: string | null }) {
  // meshopt-compressed geometry; no Draco, so no decoder is fetched from a CDN
  const { scene } = useGLTF(url, false, true);

  const { root, blend } = useMemo(() => {
    const clone = scene.clone(true);
    let blendHandle: ReturnType<typeof blendableMap> | null = null;

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(
        (material) => {
          const copy = material.clone();
          if (copy instanceof THREE.MeshStandardMaterial) {
            copy.roughness = LEATHER.roughness;
            copy.metalness = 0;
            copy.envMapIntensity = LEATHER.envMapIntensity;
            if (copy.name === GLB_COLOURWAY_MATERIAL && copy.map && !blendHandle) {
              blendHandle = blendableMap(copy);
            }
          }
          return copy;
        },
      );
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
    });

    // Normalise: rotate, scale to length, sit on the ground, centre
    clone.rotation.y = GLB_ROTATION_Y;
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    clone.scale.setScalar(SHOE_LENGTH / Math.max(size.x, size.z, 1e-6));
    clone.updateMatrixWorld(true);
    box.setFromObject(clone);
    const centre = box.getCenter(new THREE.Vector3());
    clone.position.set(-centre.x, -box.min.y, -centre.z);

    return { root: clone, blend: blendHandle as ReturnType<typeof blendableMap> | null };
  }, [scene]);

  useEffect(() => {
    blend?.setTarget(texture);
  }, [blend, texture]);

  useFrame((_, delta) => blend?.update(Math.min(delta, 0.1)));

  // Free the cloned materials and loaded colourway textures with the scene
  useEffect(
    () => () => {
      void blend?.dispose();
      root.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) =>
          m.dispose(),
        );
      });
    },
    [root, blend],
  );

  return <primitive object={root} />;
}
