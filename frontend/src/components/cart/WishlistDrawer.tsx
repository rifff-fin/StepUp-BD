import type { CSSProperties } from 'react';
import { FiHeart } from 'react-icons/fi';
import { Drawer } from '../ui/Overlay';
import { ShoeArt } from '../product/ShoeArt';
import { Suggestions } from './Suggestions';
import { formatTaka, tintOf } from '../../lib/format';
import { useUi } from '../../store/uiStore';
import { useWishlist } from '../../store/wishlistStore';

/** Slide-in wishlist. "View" reopens the quick view to pick a size and add to cart. */
export function WishlistDrawer() {
  const open = useUi((s) => s.panel === 'wishlist');
  const close = useUi((s) => s.closePanel);
  const items = useWishlist((s) => s.items);

  return (
    <Drawer
      open={open}
      onClose={close}
      titleId="wish-title"
      title={
        <>
          Wishlist <span>({items.length})</span>
        </>
      }
    >
      {items.length === 0 ? (
        <>
          <div className="empty-state">
            <FiHeart aria-hidden="true" />
            <h3>Nothing saved yet</h3>
            <p>Tap the heart on any pair to keep it here for later.</p>
          </div>
          <Suggestions />
        </>
      ) : (
        <>
          <ul aria-label="Saved products">
            {items.map((product) => (
              <li key={product._id} className="line-item">
                <div
                  className="li-img"
                  style={{ '--tint-a': tintOf(product.palette) } as CSSProperties}
                >
                  <ShoeArt palette={product.palette} silhouette={product.silhouette} />
                </div>
                <div>
                  <div className="li-top">
                    <div>
                      <p className="li-name">{product.name}</p>
                      <p className="li-meta">
                        {product.brand} ·{' '}
                        <s>
                          <span className="sr-only">Was </span>
                          {formatTaka(product.originalPrice)}
                        </s>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove"
                      onClick={() => useWishlist.getState().remove(product._id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="li-bottom">
                    <span className="li-price">{formatTaka(product.price)}</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => useUi.getState().openQuickView(product)}
                      aria-label={`Choose a size for ${product.name}`}
                    >
                      Choose size
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Suggestions exclude={items.map((p) => p._id)} />
        </>
      )}
    </Drawer>
  );
}
