import { useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { getShoeGeometry } from './shoeGeometry';
import { createShoeMaterials, disposeMaterials, easeMaterials, paletteTargets } from './materials';
import type { Palette } from '../types';

/**
 * The procedural sneaker (shoeGeometry.ts) with its materials. Changing `palette` blends
 * every part to the new colours over ~0.5 s.
 */
export function ProceduralShoe({ palette }: { palette: Palette }) {
  const geo = getShoeGeometry();
  // Created once with the first palette; later palettes are eased towards
  const [materials] = useState(() => createShoeMaterials(palette));
  const targets = useMemo(() => paletteTargets(palette), [palette]);

  useEffect(() => () => disposeMaterials(materials), [materials]);

  useFrame((_, delta) => easeMaterials(materials, targets, delta));

  return (
    <group>
      <mesh geometry={geo.outsole} material={materials.outsole} />
      <mesh geometry={geo.foxing} material={materials.foxing} />
      <mesh geometry={geo.midsole} material={materials.midsole} />
      <mesh geometry={geo.upper} material={materials.upper} />
      <mesh geometry={geo.overlays} material={materials.overlay} />
      <mesh geometry={geo.stripes} material={materials.stripe} />
      <mesh geometry={geo.collar} material={materials.collar} />
      <mesh geometry={geo.tongue} material={materials.tongue} />
      <mesh geometry={geo.tongueTag} material={materials.tab} />
      <mesh geometry={geo.heelTab} material={materials.tab} />
      <mesh geometry={geo.laces} material={materials.laces} />
      <mesh geometry={geo.eyelets} material={materials.eyelet} />
    </group>
  );
}
