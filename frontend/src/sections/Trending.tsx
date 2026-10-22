import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';
import { trending } from '../content/copy';
import { ProductCard, ProductCardSkeleton } from '../components/product/ProductCard';
import { getTrending } from '../services/productService';
import { isAborted } from '../lib/api';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Product } from '../types';

const AUTO_MS = 3500;

/** Scroll the track by one card (wrapping to the start from the end when `wrap`). */
function step(el: HTMLElement, direction: 1 | -1, wrap = false) {
  const max = el.scrollWidth - el.clientWidth;
  if (wrap && el.scrollLeft >= max - 4) {
    el.scrollTo({ left: 0, behavior: 'smooth' });
    return;
  }
  const card = el.querySelector<HTMLElement>(':scope > *');
  const size = card ? card.offsetWidth + 18 : el.clientWidth * 0.8;
  el.scrollBy({ left: direction * size, behavior: 'smooth' });
}

/**
 * Featured / trending carousel: it advances one card every few seconds, looping, while it
 * is on screen; hovering, focusing or touching it holds it, and the pause button stops it
 * (WCAG 2.2.2). Reduced motion turns autoplay off. Swipe or use the arrows any time.
 */
export function Trending() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const holdUntil = useRef(0);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState({ start: 0, size: 0.3 });
  const [paused, setPaused] = useState(false);
  const inView = useInView(section);
  const reduced = useReducedMotion();
  const autoplay = !reduced && !paused;

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

  // Autoplay: one card per tick while on screen, skipping ticks while the visitor is on it
  useEffect(() => {
    if (!products || !autoplay || !inView) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || document.hidden || Date.now() < holdUntil.current) return;
      if (section.current?.matches(':hover') || el.contains(document.activeElement)) return;
      step(el, 1, true);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [products, autoplay, inView]);

  /** The visitor is using the carousel: hold the autoplay for a while. */
  const hold = (ms = AUTO_MS * 2) => {
    holdUntil.current = Date.now() + ms;
  };

  const scrollBy = (direction: 1 | -1) => {
    hold();
    if (track.current) step(track.current, direction);
  };

  if (failed) return null; // the catalog below shows the error and a retry

  return (
    <section id="trending" ref={section} className="section" aria-labelledby="trending-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">{trending.eyebrow}</span>
            <h2 id="trending-title" className="display">
              {trending.title} <em>{trending.titleAccent}</em>
            </h2>
          </div>
          <div className="carousel-nav">
            {!reduced && (
              <button
                type="button"
                className="round-btn"
                aria-label={paused ? 'Play the trending carousel' : 'Pause the trending carousel'}
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? <FiPlay /> : <FiPause />}
              </button>
            )}
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
          onPointerDown={() => hold(AUTO_MS * 3)}
          onWheel={() => hold()}
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
