import type { Palette } from '../types';

/**
 * Swap the procedural shoe for a real model (see README, "Use a .glb shoe model").
 *
 * 1. Put the file in frontend/public/models/, e.g. public/models/shoe.glb
 * 2. Set SHOE_MODEL_URL to '/models/shoe.glb'
 * 3. Map the model's material names to palette parts in GLB_MATERIALS so the colour
 *    switcher and product colours still work (unmapped materials keep their own colours).
 *
 * The model is scaled to the procedural shoe's size (3.3 units long), so the hero camera
 * and the quick-view viewer need no changes. Turn it with GLB_ROTATION_Y if the toe does
 * not point along +x.
 */
export const SHOE_MODEL_URL: string | null = null;

export const GLB_MATERIALS: Record<string, keyof Palette> = {
  // 'Upper': 'upper',
  // 'Overlay': 'overlay',
  // 'Sole': 'midsole',
  // 'Outsole': 'outsole',
  // 'Laces': 'laces',
};

export const GLB_ROTATION_Y = 0;

/** Target length of the shoe in scene units (matches the procedural model). */
export const SHOE_LENGTH = 3.3;
