import { Suspense } from 'react';
import { SHOE_MODEL_URL } from './config';
import { GltfShoe } from './GltfShoe';
import { ProceduralShoe } from './ProceduralShoe';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import type { Colorway } from './colorways';

/**
 * The shoe, standing on y = 0 and centred on x/z: the real AJ1 model when configured, with
 * the procedural shoe as the stand-in while it loads and if it ever fails to load.
 */
export function Shoe({ colorway }: { colorway: Colorway }) {
  const fallback = <ProceduralShoe palette={colorway.palette} />;
  if (!SHOE_MODEL_URL) return fallback;
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={null}>
        <GltfShoe url={SHOE_MODEL_URL} texture={colorway.texture} />
      </Suspense>
    </ErrorBoundary>
  );
}
