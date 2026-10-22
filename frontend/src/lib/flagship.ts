import snapshot from '../content/demoCatalog.json';
import type { Product } from '../types';

/**
 * The flagship product: the one the 3D model shows (AJ1 High OG "Bred"). Read from the
 * bundled catalog so the hero and the spotlight work before (or without) the API; its id
 * matches the database (stable ids), so adding it to the cart works either way.
 */
export const flagship = (snapshot.products as unknown as Product[]).find((p) => p.model3d) ?? null;
