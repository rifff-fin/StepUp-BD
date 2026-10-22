import type { CSSProperties } from 'react';

/** Five stars filled to `rating` (out of 5), with an accessible label. */
export function Stars({ rating, count }: { rating: number; count?: number }) {
  const width = `${Math.max(0, Math.min(5, rating)) * 20}%`;
  return (
    <span className="rating">
      <span
        className="stars"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
        style={{ '--w': width } as CSSProperties}
      >
        <i aria-hidden="true" />
      </span>
      <span aria-hidden="true">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="sr-only">from {count} reviews</span>}
      {count !== undefined && <span aria-hidden="true">({count})</span>}
    </span>
  );
}
