import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { ProductPhoto } from './ProductPhoto';
import { formatTaka, sizeLabel } from '../../lib/format';
import { fullOf, hasThumb, thumbOf } from '../../lib/images';
import { useUi } from '../../store/uiStore';
import { useIsWished, useWishlist } from '../../store/wishlistStore';
import type { Product } from '../../types';

const SIZES = '(min-width: 1360px) 330px, (min-width: 900px) 30vw, 50vw';

/** Catalog / trending card: the photo (the second one on hover), brand, name, price, sizes. */
export function ProductCard({ product }: { product: Product }) {
  const openQuickView = useUi((s) => s.openQuickView);
  const wished = useIsWished(product._id);
  const [pop, setPop] = useState(false);
  const second = product.images?.[1];
  const onSale = product.originalPrice > product.price;

  const onToggleWish = () => {
    const added = useWishlist.getState().toggle(product);
    const ui = useUi.getState();
    ui.toast(added ? 'Saved to your wishlist' : 'Removed from wishlist');
    if (added) ui.pulseWish();
    setPop(true);
  };

  return (
    <article className="card">
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
          <ProductPhoto
            src={product.images?.[0]}
            alt={product.name}
            sizes={SIZES}
            palette={product.palette}
            silhouette={product.silhouette}
          />
          {second && hasThumb(second) && (
            <img
              className="photo photo-alt"
              src={thumbOf(second)}
              srcSet={`${thumbOf(second)} 480w, ${fullOf(second)} 900w`}
              sizes={SIZES}
              alt=""
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
        </button>
        <button
          type="button"
          className="qv-btn"
          aria-label={`Quick view ${product.name}`}
          onClick={() => openQuickView(product)}
        >
          Quick view
        </button>
      </div>
      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <h3 className="card-title">{product.name}</h3>
        <p className="price-row">
          <strong className={onSale ? 'sale' : undefined}>{formatTaka(product.price)}</strong>
          {onSale && (
            <s>
              <span className="sr-only">Was </span>
              {formatTaka(product.originalPrice)}
            </s>
          )}
        </p>
        <p className="sizes-mini">
          <span className="sr-only">Sizes in stock: </span>
          {sizeLabel(product.sizes)}
        </p>
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
        <div className="skel-line" style={{ width: '30%' }} />
        <div className="skel-line" style={{ width: '85%' }} />
        <div className="skel-line" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
