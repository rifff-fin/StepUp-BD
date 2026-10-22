import type { CSSProperties } from 'react';
import snapshot from '../../content/demoCatalog.json';
import { ProductPhoto } from '../product/ProductPhoto';
import { formatTaka, tintOf } from '../../lib/format';
import { HERO_COLORWAYS } from '../../three/colorways';
import type { Palette, Silhouette } from '../../types';

export interface SummaryLine {
  key: string;
  name: string;
  brand: string;
  size: number;
  qty: number;
  unitPrice: number;
  slug: string;
  image?: string;
  palette?: Palette;
  silhouette?: Silhouette;
}

export interface SummaryTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string | null;
}

const bySlug = new Map(
  (
    snapshot.products as unknown as {
      slug: string;
      images: string[];
      palette: Palette;
      silhouette: Silhouette;
    }[]
  ).map((p) => [p.slug, p]),
);

/** Item list + totals, shared by checkout review, success and order tracking. */
export function OrderSummary({ lines, totals }: { lines: SummaryLine[]; totals: SummaryTotals }) {
  return (
    <>
      <ul className="mini-items">
        {lines.map((line) => {
          const known = bySlug.get(line.slug);
          const palette = line.palette ?? known?.palette ?? HERO_COLORWAYS[0].palette;
          return (
            <li key={line.key} className="mini-item">
              <div className="li-img" style={{ '--tint-a': tintOf(palette) } as CSSProperties}>
                <ProductPhoto
                  src={line.image ?? known?.images?.[0]}
                  alt={line.name}
                  sizes="54px"
                  palette={palette}
                  silhouette={line.silhouette ?? known?.silhouette}
                />
              </div>
              <div>
                <b>{line.name}</b>
                <span>
                  {line.brand} · EU {line.size} · Qty {line.qty}
                </span>
              </div>
              <strong>{formatTaka(line.unitPrice * line.qty)}</strong>
            </li>
          );
        })}
      </ul>
      <div className="totals" style={{ marginTop: 16, marginBottom: 0 }}>
        <div>
          Subtotal <b>{formatTaka(totals.subtotal)}</b>
        </div>
        {totals.discount > 0 && (
          <div className="discount">
            Coupon{totals.couponCode ? ` (${totals.couponCode})` : ''}{' '}
            <b>-{formatTaka(totals.discount)}</b>
          </div>
        )}
        <div>
          Delivery <b>{formatTaka(totals.deliveryFee)}</b>
        </div>
        <div className="grand">
          Total <b>{formatTaka(totals.total)}</b>
        </div>
      </div>
    </>
  );
}
