import { SHOE_MODEL_URL } from './config';
import { GltfShoe } from './GltfShoe';
import { ProceduralShoe } from './ProceduralShoe';
import type { Palette } from '../types';

/** The shoe, standing on y = 0 and centred on x/z: the .glb if configured, else procedural. */
export function Shoe({ palette }: { palette: Palette }) {
  return SHOE_MODEL_URL ? (
    <GltfShoe url={SHOE_MODEL_URL} palette={palette} />
  ) : (
    <ProceduralShoe palette={palette} />
  );
}
