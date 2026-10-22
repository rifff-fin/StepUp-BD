import { useState, type CSSProperties, type FormEvent } from 'react';
import { FiArrowRight, FiShoppingBag, FiTag, FiX } from 'react-icons/fi';
import { Drawer } from '../ui/Overlay';
import { QtyStepper } from '../ui/QtyStepper';
import { ShoeArt } from '../product/ShoeArt';
import { Suggestions } from './Suggestions';
import { formatTaka, tintOf } from '../../lib/format';
import { cartTotals, DELIVERY_FEES } from '../../lib/pricing';
import { scrollToId } from '../../lib/lenis';
import { validateCoupon } from '../../services/storeService';
import { selectCartCount, useCart } from '../../store/cartStore';
import { useUi } from '../../store/uiStore';

/** Slide-in cart: lines, quantities, delivery zone, coupon and totals. */
export function CartDrawer() {
  const open = useUi((s) => s.panel === 'cart');
  const close = useUi((s) => s.closePanel);
  const items = useCart((s) => s.items);
  const zone = useCart((s) => s.zone);
  const coupon = useCart((s) => s.coupon);
  const count = useCart(selectCartCount);
  const totals = cartTotals(items, zone, coupon);

  return (
    <Drawer
      open={open}
      onClose={close}
      titleId="cart-title"
      title={
        <>
          Your Cart <span>({count})</span>
        </>
      }
      footer={items.length ? <CartFooter totals={totals} /> : undefined}
    >
      {items.length === 0 ? (
        <>
          <div className="empty-state">
            <FiShoppingBag aria-hidden="true" />
            <h3>Your cart is empty</h3>
            <p>Find your next favourite pair. Prices start at ৳3,000.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                close();
                scrollToId('shop');
              }}
            >
              Start shopping <FiArrowRight aria-hidden="true" />
            </button>
          </div>
          <Suggestions />
        </>
      ) : (
        <ul aria-label="Items in your cart">
          {items.map((item) => (
            <li key={item.key} className="line-item">
              <div className="li-img" style={{ '--tint-a': tintOf(item.palette) } as CSSProperties}>
                <ShoeArt palette={item.palette} silhouette={item.silhouette} />
              </div>
              <div>
                <div className="li-top">
                  <div>
                    <p className="li-name">{item.name}</p>
                    <p className="li-meta">
                      {item.brand} · EU {item.size} · {formatTaka(item.price)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => useCart.getState().remove(item.key)}
                    aria-label={`Remove ${item.name}, EU ${item.size}`}
                  >
                    Remove
                  </button>
                </div>
                <div className="li-bottom">
                  <QtyStepper
                    value={item.qty}
                    onChange={(qty) => useCart.getState().setQty(item.key, qty)}
                    label={`Quantity of ${item.name}, EU ${item.size}`}
                  />
                  <span className="li-price">{formatTaka(item.price * item.qty)}</span>
                </div>
              </div>
            </li>
          ))}
          <li>
            <Suggestions exclude={items.map((item) => item.productId)} />
          </li>
        </ul>
      )}
    </Drawer>
  );
}

function CartFooter({ totals }: { totals: ReturnType<typeof cartTotals> }) {
  const zone = useCart((s) => s.zone);
  const coupon = useCart((s) => s.coupon);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const apply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage({ ok: false, text: 'Enter a coupon code' });
      return;
    }
    setChecking(true);
    const result = await validateCoupon(trimmed, totals.subtotal);
    setChecking(false);
    if (result?.valid) {
      useCart.getState().applyCoupon({ code: result.code, percent: result.percent });
      setMessage({ ok: true, text: result.message });
      setCode('');
    } else {
      setMessage({ ok: false, text: 'That coupon code is not valid' });
    }
  };

  return (
    <>
      <fieldset className="zone">
        <legend className="sr-only">Delivery area</legend>
        <label>
          <input
            type="radio"
            name="zone"
            checked={zone === 'inside-dhaka'}
            onChange={() => useCart.getState().setZone('inside-dhaka')}
          />
          <span>
            Inside Dhaka <small>{formatTaka(DELIVERY_FEES['inside-dhaka'])} · 1–2 days</small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            name="zone"
            checked={zone === 'outside-dhaka'}
            onChange={() => useCart.getState().setZone('outside-dhaka')}
          />
          <span>
            Outside Dhaka <small>{formatTaka(DELIVERY_FEES['outside-dhaka'])} · 3–5 days</small>
          </span>
        </label>
      </fieldset>

      {coupon ? (
        <div className="coupon-applied">
          <span>
            <FiTag aria-hidden="true" /> {coupon.code} · {coupon.percent}% off
          </span>
          <button
            type="button"
            className="remove"
            onClick={() => {
              useCart.getState().removeCoupon();
              setMessage(null);
            }}
            aria-label={`Remove coupon ${coupon.code}`}
          >
            <FiX aria-hidden="true" /> Remove
          </button>
        </div>
      ) : (
        <form className="coupon" onSubmit={apply}>
          <label htmlFor="coupon" className="sr-only">
            Coupon code
          </label>
          <input
            id="coupon"
            placeholder="Coupon code, e.g. STEPUP10"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
            aria-describedby="coupon-msg"
          />
          <button type="submit" className="btn btn-ghost btn-sm" disabled={checking}>
            {checking ? 'Checking…' : 'Apply'}
          </button>
        </form>
      )}
      <p id="coupon-msg" className={`coupon-msg ${message?.ok ? 'ok' : 'err'}`} role="status">
        {message?.text}
      </p>

      <div className="totals">
        <div>
          Subtotal <b>{formatTaka(totals.subtotal)}</b>
        </div>
        {totals.discount > 0 && (
          <div className="discount">
            Coupon discount <b>-{formatTaka(totals.discount)}</b>
          </div>
        )}
        <div>
          Delivery <b>{formatTaka(totals.deliveryFee)}</b>
        </div>
        <div className="grand">
          Total <b>{formatTaka(totals.total)}</b>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={() => useUi.getState().openCheckout()}
      >
        Checkout <FiArrowRight aria-hidden="true" />
      </button>
    </>
  );
}
