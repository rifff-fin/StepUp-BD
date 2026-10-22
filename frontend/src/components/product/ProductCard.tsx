import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { FiEye, FiHeart } from 'react-icons/fi';
import { ShoeArt } from './ShoeArt';
import { Stars } from '../ui/Stars';
import { formatTaka, tintOf } from '../../lib/format';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useUi } from '../../store/uiStore';
import { useIsWished, useWishlist } from '../../store/wishlistStore';
import type { Product } from '../../types';

/** Catalog / trending card: lifts and glows on hover, tilts towards the pointer. */
export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const openQuickView = useUi((s) => s.openQuickView);
  const wished = useIsWished(product._id);
  const [pop, setPop] = useState(false);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const canTilt = finePointer && !reduced;

  const onToggleWish = () => {
    const added = useWishlist.getState().toggle(product);
    const ui = useUi.getState();
    ui.toast(added ? 'Saved to your wishlist' : 'Removed from wishlist');
    if (added) ui.pulseWish();
    setPop(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!canTilt || !el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    el.classList.add('tilting');
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.classList.remove('tilting');
  };

  return (
    <article
      ref={ref}
      className="card"
      style={{ '--tint-a': tintOf(product.palette) } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="card-media">
        <div className="badges">
          {product.discountPercent > 0 && (
            <span className="badge badge-off">-{product.discountPercent}%</span>
          )}
          {product.isNewArrival && <span className="badge badge-new">New</span>}
        </div>
        <button
          type="button"
          className={`heart ${pop ? 'pop' : ''}`}
          aria-pressed={wished}
          aria-label={
            wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          onClick={onToggleWish}
          onAnimationEnd={() => setPop(false)}
        >
          <FiHeart />
        </button>
        <button
          type="button"
          className="card-img"
          tabIndex={-1}
          aria-label={`Quick view ${product.name}`}
          onClick={() => openQuickView(product)}
        >
          <ShoeArt
            palette={product.palette}
            silhouette={product.silhouette}
            label={`${product.name}, side view`}
          />
        </button>
        <button
          type="button"
          className="qv-btn"
          aria-label={`Quick view ${product.name}`}
          onClick={() => openQuickView(product)}
        >
          <FiEye aria-hidden="true" /> Quick View
        </button>
      </div>
      <div className="card-body">
        <p className="card-brand">
          {product.brand} · {product.category}
        </p>
        <h3 className="card-title">{product.name}</h3>
        <Stars rating={product.rating} count={product.reviewCount} />
        <div className="sizes-mini" aria-label={`Sizes in stock: EU ${product.sizes.join(', ')}`}>
          {product.sizes.map((size) => (
            <span key={size} aria-hidden="true">
              {size}
            </span>
          ))}
        </div>
        <div className="price-row">
          <strong>{formatTaka(product.price)}</strong>
          {product.originalPrice > product.price && (
            <s>
              <span className="sr-only">Was </span>
              {formatTaka(product.originalPrice)}
            </s>
          )}
        </div>
      </div>
    </article>
  );
}

/** Placeholder card while products load. */
export function ProductCardSkeleton() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="card-media" />
      <div className="card-body">
        <div className="skel-line" style={{ width: '40%' }} />
        <div className="skel-line" style={{ width: '85%' }} />
        <div className="skel-line" style={{ width: '55%' }} />
        <div className="skel-line" style={{ width: '35%', height: 22, marginTop: 8 }} />
      </div>
    </div>
  );
}
