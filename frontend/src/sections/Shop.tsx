import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { FiRefreshCw, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { shop } from '../content/copy';
import { FilterPanel } from '../components/shop/FilterPanel';
import { ProductCard, ProductCardSkeleton } from '../components/product/ProductCard';
import { useMeta, useProducts } from '../hooks/useCatalog';
import { useConnection } from '../store/connectionStore';
import { useUi } from '../store/uiStore';
import type { CatalogFilters, SortKey } from '../types';

const PRICE = { min: 3000, max: 5500 };

const DEFAULT_FILTERS: CatalogFilters = {
  q: '',
  category: 'All',
  brands: [],
  sizes: [],
  colors: [],
  minPrice: PRICE.min,
  maxPrice: PRICE.max,
  sort: 'popular',
};

/** The catalog: live search, category tabs, sorting and filters, all served by the API. */
export function Shop() {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const { meta, error: metaError, retry: retryMeta } = useMeta();
  const { products, brandCounts, loading, slow, error, retry } = useProducts(filters);
  const filtersOpen = useUi((s) => s.panel === 'filters');
  const offline = useConnection((s) => s.offline);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const update = useCallback(
    (patch: Partial<CatalogFilters>) => setFilters((prev) => ({ ...prev, ...patch })),
    [],
  );

  const reset = () =>
    setFilters({
      ...DEFAULT_FILTERS,
      minPrice: meta?.priceRange.min ?? PRICE.min,
      maxPrice: meta?.priceRange.max ?? PRICE.max,
    });

  const activeFilters =
    filters.brands.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.minPrice > PRICE.min || filters.maxPrice < PRICE.max ? 1 : 0);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + shop.tabs.length) % shop.tabs.length;
    update({ category: shop.tabs[next] });
    tabRefs.current[next]?.focus();
  };

  const count = products?.length ?? null;

  return (
    <section id="shop" className="section" aria-labelledby="shop-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">{shop.eyebrow}</span>
            <h2 id="shop-title" className="display">
              {shop.title} <em>{shop.titleAccent}</em>
            </h2>
          </div>
          <p>{shop.lede}</p>
        </div>

        <div className="shop-toolbar">
          <div className="search" role="search">
            <FiSearch aria-hidden="true" />
            <label htmlFor="catalog-search" className="sr-only">
              Search sneakers
            </label>
            <input
              id="catalog-search"
              type="search"
              placeholder={shop.searchPlaceholder}
              value={filters.q}
              onChange={(event) => update({ q: event.target.value })}
              autoComplete="off"
              enterKeyHint="search"
            />
            {filters.q && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => update({ q: '' })}
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="toolbar-controls">
            <button
              type="button"
              className="btn btn-ghost btn-sm filter-toggle"
              aria-controls="filters"
              aria-expanded={filtersOpen}
              onClick={() => useUi.getState().openPanel('filters')}
            >
              <FiSliders aria-hidden="true" /> Filters{activeFilters ? ` (${activeFilters})` : ''}
            </button>
            <div className="select">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as SortKey })}
              >
                {shop.sorts.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tabs" role="tablist" aria-label="Categories">
            {shop.tabs.map((tab, i) => (
              <button
                key={tab}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${tab}`}
                className="tab"
                aria-selected={filters.category === tab}
                aria-controls="catalog-grid"
                tabIndex={filters.category === tab ? 0 : -1}
                onClick={() => update({ category: tab })}
                onKeyDown={(event) => onTabKey(event, i)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-layout">
          {meta ? (
            <FilterPanel
              meta={meta}
              filters={filters}
              onChange={update}
              onReset={reset}
              brandCounts={brandCounts}
              resultCount={count}
              open={filtersOpen}
              onClose={() => useUi.getState().closePanel()}
            />
          ) : (
            <div aria-hidden="true" />
          )}

          <div>
            <div className="toolbar-row" style={{ marginBottom: 14 }}>
              <p className="result-count" role="status" aria-live="polite">
                {loading && <span className="spinner sm" aria-hidden="true" />}
                {slow
                  ? shop.slowServer
                  : count !== null && (
                      <span>
                        <b>{count}</b> {count === 1 ? 'pair' : 'pairs'} found
                      </span>
                    )}
              </p>
              {offline && (
                <span className="offline-note" title="The store server could not be reached">
                  Showing the built-in demo catalog
                </span>
              )}
              {activeFilters > 0 || filters.q || filters.category !== 'All' ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                  Clear all
                </button>
              ) : null}
            </div>

            <div
              id="catalog-grid"
              role="tabpanel"
              aria-labelledby={`tab-${filters.category}`}
              aria-busy={loading}
              className={`grid ${loading && products ? 'stale' : ''}`}
            >
              {error || metaError ? (
                <div className="empty">
                  <h3>Can't reach the store</h3>
                  <p>{error ?? metaError}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      retry();
                      if (metaError) retryMeta();
                    }}
                  >
                    <FiRefreshCw aria-hidden="true" /> Try again
                  </button>
                </div>
              ) : !products ? (
                Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
              ) : products.length === 0 ? (
                <div className="empty">
                  <h3>{shop.emptyTitle}</h3>
                  <p>{shop.emptyText}</p>
                  <button type="button" className="btn btn-primary" onClick={reset}>
                    Reset filters
                  </button>
                </div>
              ) : (
                products.map((product) => <ProductCard key={product._id} product={product} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
