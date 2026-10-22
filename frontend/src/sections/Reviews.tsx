import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { reviews } from '../content/copy';
import { Stars } from '../components/ui/Stars';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';

const AUTOPLAY_MS = 5500;

/** Customer reviews slider. Clearly labelled as sample content. */
export function Reviews() {
  const twoUp = useMediaQuery('(min-width: 600px)');
  const threeUp = useMediaQuery('(min-width: 900px)');
  const perView = threeUp ? 3 : twoUp ? 2 : 1;
  const pages = reviews.items.length - perView + 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const current = Math.min(index, pages - 1);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % pages), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, pages]);

  const go = (next: number) => setIndex((next + pages) % pages);

  return (
    <section id="reviews" className="section" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head">
          <h2 id="reviews-title" className="section-title">
            {reviews.title}
          </h2>
          <span className="sample-label">
            <FiAlertTriangle aria-hidden="true" /> {reviews.sampleLabel}
          </span>
        </div>

        <div
          data-reveal
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="reviews-viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="Sample customer reviews"
          >
            <div
              className="reviews-track"
              style={{ transform: `translateX(-${(current * 100) / perView}%)` }}
            >
              {reviews.items.map((review, i) => {
                const visible = i >= current && i < current + perView;
                return (
                  <div
                    className="review"
                    key={review.name}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${reviews.items.length}`}
                    aria-hidden={!visible}
                  >
                    <figure className="review-card" style={{ margin: 0 }}>
                      <Stars rating={review.rating} />
                      <blockquote style={{ margin: 0, flex: 1 }}>
                        <p>{review.text}</p>
                      </blockquote>
                      <figcaption className="reviewer">
                        <b>{review.name}</b>
                        <span>{review.place} · Sample</span>
                      </figcaption>
                    </figure>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="reviews-controls">
            <div className="dots">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="dot"
                  aria-label={`Show reviews from ${i + 1}`}
                  aria-current={i === current}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <div className="carousel-nav">
              <button
                type="button"
                className="round-btn"
                aria-label="Previous reviews"
                onClick={() => go(current - 1)}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="round-btn"
                aria-label="Next reviews"
                onClick={() => go(current + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
