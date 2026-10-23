import { useEffect, useState } from 'react';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { adminApi, type Subscriber } from '../adminApi';

/** Newsletter subscribers: list, remove, export as CSV. */
export function SubscribersPage() {
  const [list, setList] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .subscribers()
      .then(setList)
      .catch((err: unknown) => setError(apiErrorMessage(err)));
  }, []);

  const exportCsv = () => {
    if (!list) return;
    const rows = [['email', 'subscribed'], ...list.map((s) => [s.email, s.createdAt])];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'subscribers.csv',
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (sub: Subscriber) => {
    if (!window.confirm(`Remove ${sub.email}?`)) return;
    try {
      await adminApi.deleteSubscriber(sub._id);
      setList((l) => l?.filter((s) => s._id !== sub._id) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <>
      <header className="a-head a-head-row">
        <div>
          <h1>Subscribers</h1>
          <p>Emails from the newsletter form.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={exportCsv}
          disabled={!list?.length}
        >
          <FiDownload aria-hidden="true" /> Export CSV
        </button>
      </header>
      {error && <p className="a-error">{error}</p>}
      {!list ? (
        <div className="a-loading">Loading…</div>
      ) : list.length === 0 ? (
        <p className="a-empty">No subscribers yet.</p>
      ) : (
        <div className="a-card a-card-flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id}>
                  <td>{s.email}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button
                      type="button"
                      className="a-icon"
                      onClick={() => remove(s)}
                      aria-label={`Remove ${s.email}`}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
