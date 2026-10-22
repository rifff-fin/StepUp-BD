/**
 * The 3D shoe. The hero shows a real model of the Air Jordan 1 High OG "Bred" (client
 * requirement). It is built from "Air Jordan 1" by makoto (Sketchfab, CC BY 4.0, credited
 * in the footer and README), reduced to a single shoe, recoloured to Bred from the original
 * black/white, and compressed (meshopt geometry + WebP textures).
 *
 * To use a different model: put the .glb in frontend/public/models/, point SHOE_MODEL_URL
 * at it and set GLB_ROTATION_Y if the toe does not point along +x. Set it to null to fall
 * back to the procedural shoe (src/three/shoeGeometry.ts).
 */
export const SHOE_MODEL_URL: string | null = '/models/aj1-bred.glb';

/** Material in the .glb whose base texture changes with the colour switcher. */
export const GLB_COLOURWAY_MATERIAL = 'shoe';

export const GLB_ROTATION_Y = 0;

/** Target length of the shoe in scene units (the procedural model is the same length). */
export const SHOE_LENGTH = 3.3;

/**
 * Leather, not plastic: the source materials are glossy. Roughness multiplies the model's
 * own roughness map; reflections from the studio environment are toned down.
 */
export const LEATHER = { roughness: 1, envMapIntensity: 0.55 };

/** Seconds for the cross-fade between colourway textures. */
export const COLOURWAY_FADE = 0.6;
