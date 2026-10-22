import { productReviews } from '../content/copy';
import type { Product } from '../types';

export interface SampleReview {
  name: string;
  place: string;
  rating: number;
  text: string;
  daysAgo: number;
}

/** Small deterministic hash so a product always shows the same sample reviews. */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Three illustrative reviews for a product (sample content, labelled as such in the UI).
 * Ratings stay close to the product's average.
 */
export function sampleReviewsFor(product: Product, count = 3): SampleReview[] {
  const { names, places, texts } = productReviews;
  const seed = hash(product.slug);
  // Step 3 through each list (coprime with its length): no repeats within a product
  return Array.from({ length: count }, (_, i) => ({
    name: names[(seed + i * 3) % names.length],
    place: places[((seed >>> 4) + i * 3) % places.length],
    rating: product.rating >= 4.7 || i !== 2 ? 5 : 4,
    text: texts[((seed >>> 8) + i * 3) % texts.length],
    daysAgo: 2 + (((seed >>> 12) + i * 11) % 40),
  }));
}
