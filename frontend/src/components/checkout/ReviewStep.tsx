import { FiArrowLeft, FiLock } from 'react-icons/fi';
import { OrderSummary } from './OrderSummary';
import { formatTaka } from '../../lib/format';
import { normalizePhone, paymentLabel } from '../../lib/checkout';
import type { cartTotals } from '../../lib/pricing';
import type { CartItem, PaymentMethod, ShippingDetails } from '../../types';

interface Props {
  items: CartItem[];
  totals: ReturnType<typeof cartTotals>;
  couponCode: string | null;
  shipping: ShippingDetails;
  method: PaymentMethod;
  error: string;
  onEdit: (step: 'shipping' | 'payment') => void;
  onPlace: () => void;
}

/** Step 3: everything at a glance before placing the order. */
export function ReviewStep({
  items,
  totals,
  couponCode,
  shipping,
  method,
  error,
  onEdit,
  onPlace,
}: Props) {
  return (
    <div className="co-step">
      <div className="review-block">
        <h4>Items ({items.reduce((n, i) => n + i.qty, 0)})</h4>
        <OrderSummary
          lines={items.map((item) => ({ ...item, unitPrice: item.price }))}
          totals={{ ...totals, couponCode }}
        />
      </div>
      <div className="review-block">
        <h4>
          Deliver to
          <button type="button" onClick={() => onEdit('shipping')}>
            Edit
          </button>
        </h4>
        <p>
          <b>{shipping.name}</b> · {normalizePhone(shipping.phone)}
          <br />
          {shipping.address}, {shipping.district}
          {shipping.note && (
            <>
              <br />
              Note: {shipping.note}
            </>
          )}
        </p>
      </div>
      <div className="review-block">
        <h4>
          Payment
          <button type="button" onClick={() => onEdit('payment')}>
            Edit
          </button>
        </h4>
        <p>
          {paymentLabel(method)}
          {method === 'card' && ' · test card ending 4242'}
          {method === 'cod' && ` · pay ${formatTaka(totals.total)} to the rider`}
        </p>
      </div>

      {error && (
        <p className="co-error" role="alert">
          {error}
        </p>
      )}

      <div className="co-nav">
        <button type="button" className="btn btn-ghost" onClick={() => onEdit('payment')}>
          <FiArrowLeft aria-hidden="true" /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onPlace}>
          <FiLock aria-hidden="true" />
          {method === 'cod' ? 'Place order' : `Pay ${formatTaka(totals.total)}`}
        </button>
      </div>
    </div>
  );
}
