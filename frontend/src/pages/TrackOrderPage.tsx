import { useState, type FormEvent } from 'react';
import { FiCalendar, FiCheck, FiPackage, FiSearch, FiTruck } from 'react-icons/fi';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { apiErrorMessage } from '../lib/api';
import { isBdMobile, LAST_ORDER_KEY, normalizePhone, paymentLabel } from '../lib/checkout';
import { formatDay, formatDayRange } from '../lib/format';
import { readPref } from '../lib/storage';
import { getOrder } from '../services/storeService';
import type { Order } from '../types';

const STAGES = [
  { id: 'placed', label: 'Order placed', icon: FiCheck },
  { id: 'confirmed', label: 'Confirmed by phone', icon: FiPackage },
  { id: 'shipped', label: 'Out for delivery', icon: FiTruck },
  { id: 'delivered', label: 'Delivered', icon: FiCalendar },
];

function lastOrder() {
  try {
    return JSON.parse(readPref(LAST_ORDER_KEY) || 'null') as {
      orderNumber: string;
      phone: string;
    } | null;
  } catch {
    return null;
  }
}

/** Order tracking: order ID + the phone used at checkout (both must match). */
export function TrackOrderPage() {
  const [saved] = useState(lastOrder);
  const [orderNumber, setOrderNumber] = useState(saved?.orderNumber ?? '');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const id = orderNumber.trim().toUpperCase();
    if (!/^SUBD-\d{5}$/.test(id) || !isBdMobile(phone)) {
      setError('Enter your order ID (like SUBD-48291) and the mobile number you used.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setOrder(await getOrder(id, normalizePhone(phone)));
    } catch (err) {
      setOrder(null);
      setError(apiErrorMessage(err, 'No order found with that ID and phone number.'));
    } finally {
      setLoading(false);
    }
  };

  const stage = order
    ? Math.max(
        0,
        STAGES.findIndex((s) => s.id === order.status),
      )
    : -1;

  return (
    <section className="page" aria-labelledby="track-title">
      <div className="container page-narrow">
        <span className="eyebrow">Order status</span>
        <h1 id="track-title" className="display">
          Track your order
        </h1>
        <p className="page-lede">
          Enter the order ID from your confirmation (for example SUBD-48291) and the mobile number
          you used at checkout.
          {saved && ' We filled in your most recent demo order.'}
        </p>

        <form className="track-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="track-id">Order ID</label>
            <input
              id="track-id"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="SUBD-48291"
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label htmlFor="track-phone">Mobile number</label>
            <input
              id="track-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSearch aria-hidden="true" /> {loading ? 'Looking…' : 'Track'}
          </button>
        </form>
        <p className="co-error" role="alert" hidden={!error}>
          {error}
        </p>

        <ol className="timeline" aria-label="Delivery stages">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id} className={i <= stage ? 'reached' : ''}>
                <span aria-hidden="true">
                  <Icon />
                </span>
                {s.label}
                {i <= stage && <span className="sr-only"> (done)</span>}
              </li>
            );
          })}
        </ol>

        {order && (
          <div className="track-result">
            <div className="review-block">
              <h4>
                {order.orderNumber}
                <span>Placed {formatDay(order.createdAt)}</span>
              </h4>
              <p>
                Estimated delivery:{' '}
                <b>{formatDayRange(order.estimatedDelivery.from, order.estimatedDelivery.to)}</b> to{' '}
                {order.shipping.district}
                <br />
                Payment: {paymentLabel(order.payment.method)}
                {order.payment.status === 'cod-pending' ? ' (pay on delivery)' : ' (demo, paid)'}
              </p>
            </div>
            <div className="review-block">
              <h4>Items</h4>
              <OrderSummary
                lines={order.items.map((item) => ({ ...item, key: `${item.slug}:${item.size}` }))}
                totals={order.pricing}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
