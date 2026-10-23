import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiErrorMessage } from '../../lib/api';
import { formatTaka } from '../../lib/format';
import { adminApi, type AdminStats } from '../adminApi';
import { StatusBadge } from './OrdersPage';

/** Dashboard: revenue, orders by status, catalog and subscriber counts, last 14 days. */
export function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err: unknown) => setError(apiErrorMessage(err)));
  }, []);

  if (error) return <p className="a-error">{error}</p>;
  if (!stats) return <div className="a-loading">Loading…</div>;

  const totalOrders = Object.values(stats.orders).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...stats.daily.map((d) => d.orders));

  return (
    <>
      <header className="a-head">
        <h1>Dashboard</h1>
        <p>Demo orders are removed automatically after 30 days.</p>
      </header>
      <div className="a-stats">
        <Stat label="Revenue (not cancelled)" value={formatTaka(stats.revenue)} />
        <Stat label="Orders" value={String(totalOrders)} />
        <Stat label="To confirm" value={String(stats.orders.placed ?? 0)} />
        <Stat label="Products live" value={`${stats.activeProducts} / ${stats.products}`} />
        <Stat label="Subscribers" value={String(stats.subscribers)} />
      </div>

      <div className="a-grid-2">
        <section className="a-card">
          <h2>Orders, last 14 days</h2>
          {stats.daily.length ? (
            <ul className="a-bars">
              {stats.daily.map((d) => (
                <li key={d._id} title={`${d.orders} orders, ${formatTaka(d.revenue)}`}>
                  <i style={{ height: `${(d.orders / max) * 100}%` }} />
                  <span>{d._id.slice(5)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="a-muted">No orders yet.</p>
          )}
        </section>
        <section className="a-card">
          <h2>By status</h2>
          <ul className="a-status-list">
            {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <li key={s}>
                <StatusBadge status={s} /> <b>{stats.orders[s] ?? 0}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="a-card">
        <div className="a-card-head">
          <h2>Latest orders</h2>
          <Link to="/admin/orders">All orders</Link>
        </div>
        {stats.recent.length ? (
          <table className="a-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o._id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.shipping.name}</td>
                  <td>{formatTaka(o.pricing.total)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a-muted">No orders yet. Place one from the store to see it here.</p>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="a-stat">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
