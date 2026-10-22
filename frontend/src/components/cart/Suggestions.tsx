import type { CSSProperties } from 'react';
import snapshot from '../../content/demoCatalog.json';
import { ProductPhoto } from '../product/ProductPhoto';
import { formatTaka, tintOf } from '../../lib/format';
import { useUi } from '../../store/uiStore';
import type { Product } from '../../types';

const picks = (snapshot.products as unknown as Product[])
  .filter((p) => p.trending)
  .sort((a, b) => b.popularity - a.popularity);

/** "You might like" picks for empty drawers, so they are never blank. */
export function Suggestions({ exclude = [] as string[] }) {
  const openQuickView = useUi((s) => s.openQuickView);
  const list = picks.filter((p) => !exclude.includes(p._id)).slice(0, 3);

  return (
    <div className="suggestions">
      <h3>You might like</h3>
      <ul>
        {list.map((product) => (
          <li key={product._id} className="line-item">
            <div
              className="li-img"
              style={{ '--tint-a': tintOf(product.palette) } as CSSProperties}
            >
              <ProductPhoto
                src={product.images?.[0]}
                alt={product.name}
                sizes="84px"
                palette={product.palette}
                silhouette={product.silhouette}
              />
            </div>
            <div>
              <p className="li-name">{product.name}</p>
              <p className="li-meta">{product.brand}</p>
              <div className="li-bottom">
                <span className="li-price">{formatTaka(product.price)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openQuickView(product)}
                  aria-label={`View ${product.name}`}
                >
                  View
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
