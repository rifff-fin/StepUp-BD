import { FiArrowRight } from 'react-icons/fi';
import { brands } from '../content/copy';
import { scrollToId } from '../lib/lenis';
import { useUi } from '../store/uiStore';

/** "Shop by brand": photo tiles that filter the catalog to one brand and jump to it. */
export function Brands() {
  const pick = (brand: string) => {
    useUi.getState().requestBrand(brand);
    scrollToId('shop');
  };

  return (
    <section id="brands" className="section" aria-labelledby="brands-title">
      <div className="container">
        <div className="section-head">
          <h2 id="brands-title" className="section-title">
            {brands.title}
          </h2>
        </div>
        <ul className="brand-grid">
          {brands.items.map((item) => (
            <li key={item.brand}>
              <button type="button" className="brand-tile" onClick={() => pick(item.brand)}>
                <img
                  src={`/products/${item.image}-480.webp`}
                  srcSet={`/products/${item.image}-480.webp 1x, /products/${item.image}.webp 2x`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="brand-label">
                  <b>
                    {item.brand} <FiArrowRight aria-hidden="true" />
                  </b>
                  <span>{item.models}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
