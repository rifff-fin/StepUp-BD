import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { trending } from '../content/copy';
import { ProductCard, ProductCardSkeleton } from '../components/product/ProductCard';
import { getTrending } from '../services/productService';
import { isAborted } from '../lib/api';
import type { Product } from '../types';

/** Featured / trending carousel: swipe or use the arrows. */
export function Trending() {
  const track = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState({ start: 0, size: 0.3 });

  useEffect(() => {
    const controller = new AbortController();
    getTrending(10, controller.signal)
      .then(setProducts)
      .catch((error: unknown) => {
        if (!isAborted(error)) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  const updateProgress = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const size = el.scrollWidth ? el.clientWidth / el.scrollWidth : 1;
    setProgress({ start: max > 0 ? (el.scrollLeft / max) * (1 - size) : 0, size });
  };

  useEffect(updateProgress, [products]);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(':scope > *');
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  if (failed) return null; // the catalog below shows the error and a retry

  return (
    <section id="trending" className="section" aria-labelledby="trending-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">{trending.eyebrow}</span>
            <h2 id="trending-title" className="display">
              {trending.title} <em>{trending.titleAccent}</em>
            </h2>
          </div>
          <div className="carousel-nav">
            <button
              type="button"
              className="round-btn"
              aria-label="Previous trending shoes"
              onClick={() => scrollBy(-1)}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="round-btn"
              aria-label="Next trending shoes"
              onClick={() => scrollBy(1)}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
        <div
          className="carousel-track"
          ref={track}
          onScroll={updateProgress}
          role="region"
          aria-label="Trending shoes"
          tabIndex={0}
        >
          {products
            ? products.map((product) => <ProductCard key={product._id} product={product} />)
            : Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
        <div className="carousel-progress" aria-hidden="true">
          <i
            style={{
              width: `${progress.size * 100}%`,
              transform: `translateX(${(progress.start / Math.max(progress.size, 0.01)) * 100}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
