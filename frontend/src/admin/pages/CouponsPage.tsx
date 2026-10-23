import { useEffect, useState, type FormEvent } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage, apiFieldErrors } from '../../lib/api';
import { adminApi, type Coupon } from '../adminApi';

const EMPTY = { code: '', percent: '10', description: '', expiresAt: '' };

/** Coupons: add, switch on/off, delete. */
export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .coupons()
      .then(setCoupons)
      .catch((err: unknown) => setError(apiErrorMessage(err)));
  }, []);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const created = await adminApi.createCoupon({
        code: form.code,
        percent: Number(form.percent),
        description: form.description,
        expiresAt: form.expiresAt || null,
        active: true,
      });
      setCoupons((list) => [created, ...(list ?? [])]);
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setError(apiErrorMessage(err));
    }
  };

  const toggle = async (coupon: Coupon) => {
    try {
      const updated = await adminApi.updateCoupon(coupon._id, {
        ...coupon,
        active: !coupon.active,
      });
      setCoupons((list) => list?.map((c) => (c._id === updated._id ? updated : c)) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const remove = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await adminApi.deleteCoupon(coupon._id);
      setCoupons((list) => list?.filter((c) => c._id !== coupon._id) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <>
      <header className="a-head">
        <h1>Coupons</h1>
        <p>Percent off the order subtotal. Shoppers enter the code in the cart.</p>
      </header>
      <form className="a-card a-inline-form" onSubmit={add}>
        <label className="a-field">
          <span>Code</span>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="EID20"
            required
          />
          {errors.code && <em>{errors.code}</em>}
        </label>
        <label className="a-field a-narrow">
          <span>% off</span>
          <input
            type="number"
            min={1}
            max={90}
            value={form.percent}
            onChange={(e) => setForm({ ...form, percent: e.target.value })}
            required
          />
          {errors.percent && <em>{errors.percent}</em>}
        </label>
        <label className="a-field">
          <span>Note</span>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Eid offer"
          />
        </label>
        <label className="a-field">
          <span>Expires (optional)</span>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          <FiPlus aria-hidden="true" /> Add coupon
        </button>
      </form>
      {error && <p className="a-error">{error}</p>}
      {!coupons ? (
        <div className="a-loading">Loading…</div>
      ) : (
        <div className="a-card a-card-flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Off</th>
                <th>Note</th>
                <th>Expires</th>
                <th>Active</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td>
                    <b>{c.code}</b>
                  </td>
                  <td>{c.percent}%</td>
                  <td>{c.description}</td>
                  <td>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-GB') : 'Never'}
                  </td>
                  <td>
                    <Toggle
                      checked={c.active}
                      onChange={() => toggle(c)}
                      label={`${c.code} active`}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="a-icon"
                      onClick={() => remove(c)}
                      aria-label={`Delete ${c.code}`}
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

/** An iOS-style switch. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="a-toggle"
      onClick={onChange}
    >
      <i />
    </button>
  );
}
