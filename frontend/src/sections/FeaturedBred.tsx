import type { CSSProperties } from 'react';
import { FiArrowRight, FiBox, FiCheck } from 'react-icons/fi';
import { featured } from '../content/copy';
import { ProductPhoto } from '../components/product/ProductPhoto';
import { flagship } from '../lib/flagship';
import { formatTaka } from '../lib/format';
import { useUi } from '../store/uiStore';

/** Spotlight on the hero's shoe: the AJ1 High OG "Bred", with a direct way to buy it. */
export function FeaturedBred() {
  const product = flagship;
  if (!product) return null;
  const open = () => useUi.getState().openQuickView(product);

  return (
    <section className="section featured" aria-labelledby="featured-title">
      <div className="container featured-grid">
        <div className="featured-media" data-reveal>
          <button type="button" className="featured-photo" onClick={open} tabIndex={-1}>
            <ProductPhoto
              src={product.images[1] ?? product.images[0]}
              alt={`${product.name}, side view`}
              sizes="(min-width: 900px) 560px, 100vw"
              palette={product.palette}
              silhouette={product.silhouette}
            />
          </button>
          <span className="featured-tag">
            <FiBox aria-hidden="true" /> 3D view inside
          </span>
        </div>

        <div className="featured-copy" data-reveal style={{ '--d': 1 } as CSSProperties}>
          <span className="eyebrow">{featured.eyebrow}</span>
          <h2 id="featured-title" className="display">
            {featured.title} <em>{featured.titleAccent}</em>
          </h2>
          <p className="featured-lede">{featured.lede}</p>
          <ul className="featured-points">
            {featured.points.map((point) => (
              <li key={point}>
                <FiCheck aria-hidden="true" /> {point}
              </li>
            ))}
          </ul>
          <p className="featured-price">
            <strong>{formatTaka(product.price)}</strong>
            <s>
              <span className="sr-only">Was </span>
              {formatTaka(product.originalPrice)}
            </s>
            <span className="badge badge-off">-{product.discountPercent}%</span>
          </p>
          <div className="hero-ctas">
            <button type="button" className="btn btn-primary" onClick={open}>
              {featured.cta} <FiArrowRight aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-ghost" onClick={open}>
              <FiBox aria-hidden="true" /> {featured.ctaSecondary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
