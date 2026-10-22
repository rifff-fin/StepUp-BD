import { marquee } from '../content/copy';

/** Red band of brand names (text only, no logos). Pauses on hover; still with reduced motion. */
export function BrandMarquee() {
  const names = [...marquee, ...marquee]; // doubled so the loop is seamless
  return (
    <div className="marquee" data-nav-dark>
      <p className="sr-only">Brands we sell: {marquee.join(', ')}</p>
      <div className="marquee-track" aria-hidden="true">
        {names.map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </div>
    </div>
  );
}
