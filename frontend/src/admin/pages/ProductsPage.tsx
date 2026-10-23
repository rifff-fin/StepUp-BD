import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { formatTaka } from '../../lib/format';
import { thumbOf } from '../../lib/images';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { adminApi } from '../adminApi';
import { ProductEditor } from './ProductEditor';
import { Toggle } from './CouponsPage';
import type { Product } from '../../types';

/** Products: search, add, edit, show/hide in the store, trending, delete. */
export function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState('');
  const query = useDebouncedValue(q, 300);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi
      .products(query)
      .then(setProducts)
      .catch((err: unknown) => setError(apiErrorMessage(err)));
  }, [query]);

  useEffect(load, [load]);

  const patch = async (product: Product, input: Partial<Product>) => {
    try {
      const updated = await adminApi.updateProduct(product._id, input);
      setProducts((list) => list?.map((p) => (p._id === updated._id ? updated : p)) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteProduct(product._id);
      setProducts((list) => list?.filter((p) => p._id !== product._id) ?? null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const saved = (product: Product) => {
    setProducts((list) => {
      if (!list) return [product];
      const exists = list.some((p) => p._id === product._id);
      return exists ? list.map((p) => (p._id === product._id ? product : p)) : [product, ...list];
    });
    setEditing(null);
  };

  return (
    <>
      <header className="a-head a-head-row">
        <div>
          <h1>Products</h1>
          <p>{products ? `${products.length} products` : ' '}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <FiPlus aria-hidden="true" /> Add product
        </button>
      </header>
      <div className="a-toolbar">
        <label className="a-search">
          <FiSearch aria-hidden="true" />
          <input
            placeholder="Search by name or brand"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Search products"
          />
        </label>
      </div>
      {error && <p className="a-error">{error}</p>}
      {!products ? (
        <div className="a-loading">Loading…</div>
      ) : (
        <div className="a-card a-card-flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>In store</th>
                <th>Trending</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className={p.active === false ? 'is-off' : ''}>
                  <td>
                    <div className="a-prod">
                      {p.images?.[0] ? (
                        <img src={thumbOf(p.images[0])} alt="" loading="lazy" />
                      ) : (
                        <span className="a-noimg" />
                      )}
                      <div>
                        <b>{p.name}</b>
                        <small>
                          {p.brand} · {p.category}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {formatTaka(p.price)}
                    {p.discountPercent > 0 && <small>-{p.discountPercent}%</small>}
                  </td>
                  <td>{p.sizes.join(', ')}</td>
                  <td>
                    <Toggle
                      checked={p.active !== false}
                      onChange={() => patch(p, { active: p.active === false })}
                      label={`${p.name} shown in store`}
                    />
                  </td>
                  <td>
                    <Toggle
                      checked={p.trending}
                      onChange={() => patch(p, { trending: !p.trending })}
                      label={`${p.name} trending`}
                    />
                  </td>
                  <td className="a-actions">
                    <button
                      type="button"
                      className="a-icon"
                      onClick={() => setEditing(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      className="a-icon"
                      onClick={() => remove(p)}
                      aria-label={`Delete ${p.name}`}
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
      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </>
  );
}
