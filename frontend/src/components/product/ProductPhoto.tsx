import { useState } from 'react';
import { ShoeArt } from './ShoeArt';
import { thumbOf } from '../../lib/images';
import type { Palette, Silhouette } from '../../types';

interface Props {
  src?: string;
  alt: string;
  /** CSS `sizes` hint: how wide the image is shown, so the browser picks thumb or full. */
  sizes?: string;
  /** Above-the-fold images load immediately; everything else is lazy. */
  eager?: boolean;
  /** Drawn placeholder if there is no photo or it fails to load. */
  palette: Palette;
  silhouette?: Silhouette;
  className?: string;
}

/**
 * A product photo: WebP with a 480px thumbnail in `srcset`, lazy-loaded, decoded off the
 * main thread. The container reserves its aspect ratio in CSS, so nothing jumps on load.
 */
export function ProductPhoto({
  src,
  alt,
  sizes = '(min-width: 1360px) 300px, (min-width: 900px) 30vw, 50vw',
  eager = false,
  palette,
  silhouette,
  className = 'photo',
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ShoeArt palette={palette} silhouette={silhouette} label={alt} className="photo-art" />;
  }

  // External URLs (e.g. a CDN) have no thumbnail convention: use them as they are
  const local = src.startsWith('/');
  return (
    <img
      className={className}
      src={src}
      srcSet={local ? `${thumbOf(src)} 480w, ${src} 900w` : undefined}
      sizes={local ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
