import { lazy, Suspense, useState, type CSSProperties } from 'react';
import {
  FiHeart,
  FiMaximize2,
  FiMinimize2,
  FiRotateCcw,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi';
import { Modal } from '../ui/Overlay';
import { QtyStepper } from '../ui/QtyStepper';
import { Stars } from '../ui/Stars';
import { ProductPhoto } from './ProductPhoto';
import { thumbOf } from '../../lib/images';
import { SizePicker } from './SizePicker';
import { ErrorBoundary } from '../layout/ErrorBoundary';
import { productReviews } from '../../content/copy';
import { formatTaka, tintOf } from '../../lib/format';
import { sampleReviewsFor } from '../../lib/sampleReviews';
import { hasWebGL } from '../../lib/webgl';
import { useCart } from '../../store/cartStore';
import { useUi } from '../../store/uiStore';
import { useIsWished, useWishlist } from '../../store/wishlistStore';
import type { Product } from '../../types';

// The 3D viewer (three + R3F) is its own chunk, loaded the first time a quick view opens
const MiniViewer = lazy(() => import('../../three/MiniViewer'));

/** Quick view dialog: big image, mini 3D viewer, size + quantity, cart and wishlist. */
export function QuickView() {
  const product = useUi((s) => s.quickView);
  const close = useUi((s) => s.closeQuickView);
  // Keep showing the last product while the dialog fades out
  const [shown, setShown] = useState<Product | null>(product);
  if (product && product !== shown) setShown(product);

  return (
    <Modal open={!!product} onClose={close} labelledBy="qv-title" closeLabel="Close quick view">
      {shown && <QuickViewBody key={shown._id} product={shown} open={!!product} />}
    </Modal>
  );
}

function QuickViewBody({ product, open }: { product: Product; open: boolean }) {
  const [size, setSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [photo, setPhoto] = useState(0);
  const wished = useIsWished(product._id);
  // The 3D viewer only for the product the model actually shows (the AJ1 "Bred")
  const show3d = !!product.model3d && hasWebGL() && !viewerFailed;
  const images = product.images ?? [];

  const addToCart = () => {
    if (!size) {
      setError('Please select a size first');
      setErrorKey((k) => k + 1);
      return;
    }
    useCart.getState().add(product, size, qty);
    const ui = useUi.getState();
    ui.closeQuickView();
    ui.toast(`Added to cart: ${product.name}, EU ${size}${qty > 1 ? ` × ${qty}` : ''}`);
    ui.pulseCart();
  };

  const toggleWish = () => {
    const added = useWishlist.getState().toggle(product);
    const ui = useUi.getState();
    ui.toast(added ? 'Saved to your wishlist' : 'Removed from wishlist');
    if (added) ui.pulseWish();
  };

  return (
    <div className="qv" style={{ '--tint-a': tintOf(product.palette) } as CSSProperties}>
      <div className={`qv-media ${expanded ? 'show3d' : ''}`}>
        <div className="qv-img">
          <ProductPhoto
            key={images[photo]}
            src={images[photo]}
            alt={`${product.name}, photo ${photo + 1} of ${Math.max(1, images.length)}`}
            sizes="(min-width: 900px) 560px, 100vw"
            eager
            palette={product.palette}
            silhouette={product.silhouette}
          />
        </div>
        {images.length > 1 && (
          <div className="qv-thumbs" role="group" aria-label="Product photos">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="qv-thumb"
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === photo}
                onClick={() => {
                  setPhoto(i);
                  setExpanded(false);
                }}
              >
                <img src={thumbOf(src)} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
        {show3d && (
          <div className={`qv-3d ${expanded ? 'expanded' : ''}`}>
            <span className="qv-3d-label">{expanded ? '3D · drag to rotate' : '3D'}</span>
            <ErrorBoundary fallback={null} onError={() => setViewerFailed(true)}>
              <Suspense
                fallback={
                  <div className="qv-3d-loading">
                    <div className="spinner sm" />
                  </div>
                }
              >
                {open && <MiniViewer />}
              </Suspense>
            </ErrorBoundary>
            <button
              type="button"
              className="qv-3d-expand"
              aria-pressed={expanded}
              aria-label={expanded ? 'Shrink 3D viewer' : 'Expand 3D viewer'}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </div>
        )}
      </div>

      <div className="qv-info">
        <p className="qv-brand">
          {product.brand} · {product.category}
        </p>
        <h2 className="qv-title" id="qv-title">
          {product.name}
        </h2>
        <Stars rating={product.rating} count={product.reviewCount} />
        <div className="qv-price">
          <strong>{formatTaka(product.price)}</strong>
          {product.originalPrice > product.price && (
            <>
              <s>
                <span className="sr-only">Was </span>
                {formatTaka(product.originalPrice)}
              </s>
              <span className="badge badge-off">Save {product.discountPercent}%</span>
            </>
          )}
        </div>
        <p className="qv-desc">{product.description}</p>

        <div>
          <div className="label-row">
            <span id="qv-size-label">Select size (EU)</span>
            <small>Struck-out sizes are sold out</small>
          </div>
          <SizePicker
            available={product.sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setError('');
            }}
            error={error}
            errorKey={errorKey}
            labelId="qv-size-label"
          />
        </div>

        <div className="qv-actions">
          <QtyStepper value={qty} onChange={setQty} label={`Quantity of ${product.name}`} />
          <button type="button" className="btn btn-primary" onClick={addToCart}>
            <FiShoppingBag aria-hidden="true" /> Add to Cart
          </button>
          <button
            type="button"
            className="wish-btn"
            aria-pressed={wished}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={toggleWish}
          >
            <FiHeart />
          </button>
        </div>

        <div className="qv-reviews">
          <div className="label-row">
            <span>{productReviews.title}</span>
            <small className="sample-tag">{productReviews.sampleLabel}</small>
          </div>
          <ul>
            {sampleReviewsFor(product).map((review) => (
              <li key={review.name}>
                <div className="qv-review-head">
                  <b>{review.name}</b>
                  <span>
                    {review.place} · {review.daysAgo} days ago
                  </span>
                </div>
                <Stars rating={review.rating} />
                <p>{review.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="perks">
          <div>
            <FiShield aria-hidden="true" />
            100% authentic
          </div>
          <div>
            <FiTruck aria-hidden="true" />
            Cash on Delivery
          </div>
          <div>
            <FiRotateCcw aria-hidden="true" />
            7-day return
          </div>
        </div>
      </div>
    </div>
  );
}
