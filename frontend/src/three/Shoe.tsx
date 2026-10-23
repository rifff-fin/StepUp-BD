import { Suspense, useEffect } from 'react';
import { SHOE_MODEL_URL } from './config';
import { GltfShoe } from './GltfShoe';
import { ProceduralShoe } from './ProceduralShoe';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import type { Colorway } from './colorways';

/**
 * The shoe, standing on y = 0 and centred on x/z: the real AJ1 model when configured, with
 * the procedural shoe if it ever fails to load. `onShown` fires once a shoe is visible.
 */
export function Shoe({ colorway, onShown }: { colorway: Colorway; onShown?: () => void }) {
  const fallback = (
    <>
      <ProceduralShoe palette={colorway.palette} />
      <Shown onShown={onShown} />
    </>
  );
  if (!SHOE_MODEL_URL) return fallback;
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={null}>
        <GltfShoe url={SHOE_MODEL_URL} texture={colorway.texture} onShown={onShown} />
      </Suspense>
    </ErrorBoundary>
  );
}

/** Reports the procedural stand-in as shown as soon as it mounts. */
function Shown({ onShown }: { onShown?: () => void }) {
  useEffect(() => onShown?.(), [onShown]);
  return null;
}
