import { useRef, type CSSProperties } from 'react';
import { FiX } from 'react-icons/fi';
import { PriceRange } from './PriceRange';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { CatalogFilters, Meta } from '../../types';

interface Props {
  meta: Meta;
  filters: CatalogFilters;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
  brandCounts: Record<string, number>;
  resultCount: number | null;
  open: boolean;
  onClose: () => void;
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Brand, price, size and colour filters: a sidebar on desktop, a slide-in panel on phones. */
export function FilterPanel({
  meta,
  filters,
  onChange,
  onReset,
  brandCounts,
  resultCount,
  open,
  onClose,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const desktop = useMediaQuery('(min-width: 1100px)');
  const isDialog = !desktop;
  useFocusTrap(isDialog && open, ref, onClose);

  return (
    <>
      {isDialog && (
        <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      )}
      <aside
        ref={ref}
        id="filters"
        className={`filters ${open ? 'open' : ''}`}
        aria-label="Filters"
        {...(isDialog ? { role: 'dialog', 'aria-modal': true, 'aria-hidden': !open } : {})}
        data-lenis-prevent
      >
        <div className="filters-head">
          <h3>Filters</h3>
          <button
            type="button"
            className="icon-btn close-filters"
            onClick={onClose}
            aria-label="Close filters"
          >
            <FiX />
          </button>
        </div>

        <fieldset className="fgroup">
          <legend>Brand</legend>
          {meta.brands.map((brand) => (
            <label className="check" key={brand}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => onChange({ brands: toggle(filters.brands, brand) })}
              />
              {brand}
              <span className="n" aria-label={`${brandCounts[brand] ?? 0} pairs`}>
                {brandCounts[brand] ?? 0}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="fgroup" role="group" aria-labelledby="price-label">
          <h4 id="price-label">Price</h4>
          <PriceRange
            min={meta.priceRange.min}
            max={meta.priceRange.max}
            low={filters.minPrice}
            high={filters.maxPrice}
            onChange={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
          />
        </div>

        <div className="fgroup" role="group" aria-labelledby="size-label">
          <h4 id="size-label">Size (EU)</h4>
          <div className="chips">
            {meta.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className="chip"
                aria-pressed={filters.sizes.includes(size)}
                onClick={() => onChange({ sizes: toggle(filters.sizes, size) })}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="fgroup" role="group" aria-labelledby="color-label">
          <h4 id="color-label">Colour</h4>
          <div className="chips">
            {meta.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                className="color-chip"
                aria-pressed={filters.colors.includes(color.name)}
                onClick={() => onChange({ colors: toggle(filters.colors, color.name) })}
              >
                <i style={{ '--c': color.hex } as CSSProperties} aria-hidden="true" />
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-foot">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Reset all
          </button>
          <button type="button" className="btn btn-primary btn-sm apply" onClick={onClose}>
            {resultCount === null ? 'Show results' : `Show ${resultCount} pairs`}
          </button>
        </div>
      </aside>
    </>
  );
}
