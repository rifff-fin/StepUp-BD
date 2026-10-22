import * as THREE from 'three';
import type { Palette } from '../types';

export type ShoePart =
  | 'upper'
  | 'tongue'
  | 'overlay'
  | 'stripe'
  | 'collar'
  | 'midsole'
  | 'foxing'
  | 'outsole'
  | 'laces'
  | 'tab';

/** Which palette colour each part takes. */
const PART_COLOR: Record<ShoePart, keyof Palette> = {
  upper: 'upper',
  tongue: 'upper',
  overlay: 'overlay',
  stripe: 'stripe',
  collar: 'collar',
  midsole: 'midsole',
  foxing: 'tab',
  outsole: 'outsole',
  laces: 'laces',
  tab: 'tab',
};

export type ShoeMaterials = Record<ShoePart, THREE.MeshStandardMaterial> & {
  eyelet: THREE.MeshStandardMaterial;
};

/** Leather, rubber and foam finishes for each part, starting at `palette`'s colours. */
export function createShoeMaterials(palette: Palette): ShoeMaterials {
  const std = (part: ShoePart, params: THREE.MeshPhysicalMaterialParameters) =>
    new THREE.MeshPhysicalMaterial({ color: palette[PART_COLOR[part]], ...params });

  return {
    // vertex colours darken the lining inside the foot opening
    upper: std('upper', { roughness: 0.68, vertexColors: true, side: THREE.DoubleSide }),
    tongue: std('tongue', { roughness: 0.6 }),
    overlay: std('overlay', {
      roughness: 0.55,
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      side: THREE.DoubleSide,
    }),
    stripe: std('stripe', { roughness: 0.5, side: THREE.DoubleSide }),
    collar: std('collar', { roughness: 0.7 }),
    midsole: std('midsole', { roughness: 0.62 }),
    foxing: std('foxing', { roughness: 0.45 }),
    outsole: std('outsole', { roughness: 0.92 }),
    laces: std('laces', { roughness: 0.85 }),
    tab: std('tab', { roughness: 0.55 }),
    eyelet: new THREE.MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.9, roughness: 0.3 }),
  };
}

/** Target colours for a palette, one per part. */
export function paletteTargets(palette: Palette) {
  const targets = {} as Record<ShoePart, THREE.Color>;
  (Object.keys(PART_COLOR) as ShoePart[]).forEach((part) => {
    targets[part] = new THREE.Color(palette[PART_COLOR[part]]);
  });
  return targets;
}

/** Eases every part's colour towards its target (call each frame): smooth colour switches. */
export function easeMaterials(
  materials: ShoeMaterials,
  targets: Record<ShoePart, THREE.Color>,
  delta: number,
  speed = 7,
) {
  const k = 1 - Math.exp(-Math.min(delta, 0.1) * speed);
  (Object.keys(targets) as ShoePart[]).forEach((part) => {
    materials[part].color.lerp(targets[part], k);
  });
}

export function disposeMaterials(materials: ShoeMaterials) {
  Object.values(materials).forEach((material) => material.dispose());
}
