import { useCallback, useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { paymentLabel } from '../../lib/checkout';
import { formatTaka } from '../../lib/format';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { adminApi, ORDER_STATUSES } from '../adminApi';
import type { Order } from '../../types';

export function StatusBadge({ status }: { status: string }) {
  return <span className={`a-badge s-${status}`}>{status}</span>;
}

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Orders: filter by status, search, open one for its items and address, change status. */
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const query = useDebouncedValue(q, 300);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi
      .orders({ status: status || undefined, q: query || undefined })
      .then((list) => {
        setOrders(list);
        setError('');
      })
      .catch((err: unknown) => setError(apiErrorMessage(err)));
  }, [status, query]);

  useEffect(load, [load]);

  const changeStatus = async (order: Order, next: string) => {
    try {
      const updated = await adminApi.setOrderStatus(order._id, next);
      setOrders((list) => list?.map((o) => (o._id === updated._id ? updated : o)) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <>
      <header className="a-head">
        <h1>Orders</h1>
        <p>Newest first. Change the status as you confirm, ship and deliver.</p>
      </header>
      <div className="a-toolbar">
        <label className="a-search">
          <FiSearch aria-hidden="true" />
          <input
            placeholder="Order ID, phone or name"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Search orders"
          />
        </label>
        <div className="a-seg" role="group" aria-label="Filter by status">
          {['', ...ORDER_STATUSES].map((s) => (
            <button
              key={s || 'all'}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="a-error">{error}</p>}
      {!orders ? (
        <div className="a-loading">Loading…</div>
      ) : orders.length === 0 ? (
        <p className="a-empty">No orders found.</p>
      ) : (
        <div className="a-card a-card-flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <OrderRow
                  key={o._id}
                  order={o}
                  open={open === o._id}
                  onToggle={() => setOpen(open === o._id ? null : o._id)}
                  onStatus={(next) => changeStatus(o, next)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function OrderRow({
  order,
  open,
  onToggle,
  onStatus,
}: {
  order: Order;
  open: boolean;
  onToggle: () => void;
  onStatus: (status: string) => void;
}) {
  return (
    <>
      <tr className={open ? 'is-open' : ''}>
        <td>
          <button type="button" className="a-link" onClick={onToggle} aria-expanded={open}>
            {order.orderNumber}
          </button>
        </td>
        <td>{dateTime(order.createdAt)}</td>
        <td>
          {order.shipping.name}
          <small>{order.shipping.phone}</small>
        </td>
        <td>
          {paymentLabel(order.payment.method)}
          <small>
            {order.payment.status === 'cod-pending' ? 'Collect on delivery' : 'Paid (demo)'}
          </small>
        </td>
        <td>{formatTaka(order.pricing.total)}</td>
        <td>
          <select
            className={`a-select s-${order.status}`}
            value={order.status}
            onChange={(event) => onStatus(event.target.value)}
            aria-label={`Status of ${order.orderNumber}`}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
      </tr>
      {open && (
        <tr className="a-detail">
          <td colSpan={6}>
            <div className="a-detail-grid">
              <div>
                <h3>Items</h3>
                <ul>
                  {order.items.map((item) => (
                    <li key={`${item.slug}-${item.size}`}>
                      {item.qty} × {item.name} · EU {item.size} · {formatTaka(item.lineTotal)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Deliver to</h3>
                <p>
                  {order.shipping.address}, {order.shipping.district} ({order.shipping.division})
                </p>
                {order.shipping.note && <p className="a-muted">Note: {order.shipping.note}</p>}
              </div>
              <div>
                <h3>Totals</h3>
                <p>
                  Subtotal {formatTaka(order.pricing.subtotal)}
                  {order.pricing.discount > 0 &&
                    ` · ${order.pricing.couponCode} −${formatTaka(order.pricing.discount)}`}
                  {' · '}Delivery {formatTaka(order.pricing.deliveryFee)}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
