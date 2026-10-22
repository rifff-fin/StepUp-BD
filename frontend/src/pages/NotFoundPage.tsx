import { Link } from 'react-router';
import snapshot from '../content/demoCatalog.json';
import { ProductCard } from '../components/product/ProductCard';
import type { Product } from '../types';

const picks = (snapshot.products as unknown as Product[]).filter((p) => p.trending).slice(0, 4);

export function NotFoundPage() {
  return (
    <section className="page" aria-labelledby="nf-title">
      <div className="container">
        <span className="eyebrow">Error 404</span>
        <h1 id="nf-title" className="display">
          Wrong turn
        </h1>
        <p className="page-lede">This page doesn't exist, but these pairs do.</p>
        <Link to="/" className="btn btn-primary">
          Back to the store
        </Link>
        <div className="grid" style={{ marginTop: 40 }}>
          {picks.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
