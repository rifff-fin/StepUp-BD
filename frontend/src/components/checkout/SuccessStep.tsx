import { useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { OrderSummary } from './OrderSummary';
import { fireConfetti } from './confetti';
import { formatDayRange } from '../../lib/format';
import { paymentLabel } from '../../lib/checkout';
import type { Order } from '../../types';

/** Step 4: confetti, order ID, summary and the estimated delivery window. */
export function SuccessStep({ order, onContinue }: { order: Order; onContinue: () => void }) {
  useEffect(() => fireConfetti(), []);

  const [prefix, digits] = order.orderNumber.split('-');

  return (
    <div className="success co-step">
      <div className="success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h3 id="co-success-title">Order placed!</h3>
      <p className="order-id" aria-label={`Order ID ${order.orderNumber}`}>
        {prefix}-<em>{digits}</em>
      </p>
      <p className="muted" style={{ color: 'var(--muted)', fontSize: 14 }}>
        Thanks, {order.shipping.name.split(' ')[0]}! Save your order ID to track it.
        {order.payment.method === 'cod'
          ? ' Pay the rider in cash when it arrives.'
          : ` Paid with ${paymentLabel(order.payment.method)} (demo, no real charge).`}
      </p>

      <div className="eta">
        <FiCalendar aria-hidden="true" />
        <span>
          Estimated delivery:{' '}
          <b>{formatDayRange(order.estimatedDelivery.from, order.estimatedDelivery.to)}</b>
          <br />
          to {order.shipping.district} (
          {order.deliveryZone === 'inside-dhaka' ? 'inside' : 'outside'} Dhaka)
        </span>
      </div>

      <div className="review-block">
        <h4>Order summary</h4>
        <OrderSummary
          lines={order.items.map((item) => ({ ...item, key: `${item.slug}:${item.size}` }))}
          totals={order.pricing}
        />
      </div>

      <div className="co-nav">
        <button type="button" className="btn btn-primary" onClick={onContinue} data-autofocus>
          Continue shopping
        </button>
      </div>
    </div>
  );
}
