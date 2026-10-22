import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLB_MATERIALS, GLB_ROTATION_Y, SHOE_LENGTH } from './config';
import type { Palette } from '../types';

/**
 * A real .glb shoe in place of the procedural one (enable it in three/config.ts).
 * The model is cloned per scene, scaled to SHOE_LENGTH, stood on y = 0 and centred, and
 * the materials named in GLB_MATERIALS follow the palette like the procedural shoe does.
 */
export function GltfShoe({ url, palette }: { url: string; palette: Palette }) {
  const { scene } = useGLTF(url);

  const { root, tinted } = useMemo(() => {
    const clone = scene.clone(true);
    const tintedMaterials: { material: THREE.MeshStandardMaterial; part: keyof Palette }[] = [];

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const cloned = materials.map((material) => {
        const copy = material.clone();
        const part = GLB_MATERIALS[material.name];
        if (part && copy instanceof THREE.MeshStandardMaterial) {
          tintedMaterials.push({ material: copy, part });
        }
        return copy;
      });
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
    });

    // Normalise: rotate, scale to length, sit on the ground, centre
    clone.rotation.y = GLB_ROTATION_Y;
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = SHOE_LENGTH / Math.max(size.x, size.z, 1e-6);
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);
    box.setFromObject(clone);
    const centre = box.getCenter(new THREE.Vector3());
    clone.position.set(-centre.x, -box.min.y, -centre.z);

    return { root: clone, tinted: tintedMaterials };
  }, [scene]);

  const targets = useMemo(
    () => tinted.map(({ part }) => new THREE.Color(palette[part])),
    [tinted, palette],
  );

  useEffect(
    () => () => {
      root.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) =>
          m.dispose(),
        );
      });
    },
    [root],
  );

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 7);
    tinted.forEach(({ material }, i) => material.color.lerp(targets[i], k));
  });

  return <primitive object={root} />;
}
