import { useEffect, useMemo, useState } from 'react';
import { apiErrorMessage, isAborted } from '../lib/api';
import { getProducts, toQuery } from '../services/productService';
import { getMeta } from '../services/storeService';
import { useDebouncedValue } from './useDebouncedValue';
import type { CatalogFilters, Meta, Product } from '../types';

const SLOW_MS = 4000;

interface Result {
  id: string; // which request this result belongs to
  products: Product[] | null;
  brandCounts: Record<string, number>;
  error: string | null;
}

/**
 * The catalog controller on the client: sends the filters to GET /api/products (debounced,
 * cancelling stale requests) and keeps showing the last results while the next ones load.
 */
export function useProducts(filters: CatalogFilters) {
  const query = useMemo(() => JSON.stringify(toQuery(filters)), [filters]);
  const debouncedQuery = useDebouncedValue(query, 220);
  const [attempt, setAttempt] = useState(0);
  const requestId = `${debouncedQuery}#${attempt}`;

  const [result, setResult] = useState<Result>({
    id: '',
    products: null,
    brandCounts: {},
    error: null,
  });
  const [slowId, setSlowId] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = window.setTimeout(() => setSlowId(requestId), SLOW_MS);
    getProducts(JSON.parse(debouncedQuery) as Record<string, string>, controller.signal)
      .then((data) =>
        setResult({
          id: requestId,
          products: data.products,
          brandCounts: data.facets.brands,
          error: null,
        }),
      )
      .catch((error: unknown) => {
        if (isAborted(error)) return;
        setResult((prev) => ({ ...prev, id: requestId, error: apiErrorMessage(error) }));
      })
      .finally(() => window.clearTimeout(slowTimer));

    return () => {
      controller.abort();
      window.clearTimeout(slowTimer);
    };
  }, [debouncedQuery, requestId]);

  const loading = result.id !== requestId || query !== debouncedQuery;

  return {
    products: result.products,
    brandCounts: result.brandCounts,
    error: loading ? null : result.error,
    loading,
    slow: loading && slowId === requestId,
    retry: () => setAttempt((n) => n + 1),
  };
}

/** Store configuration from GET /api/meta (cached for the visit). */
export function useMeta() {
  const [state, setState] = useState<{ meta: Meta | null; error: string | null; attempt: number }>({
    meta: null,
    error: null,
    attempt: 0,
  });

  useEffect(() => {
    let alive = true;
    getMeta()
      .then((meta) => alive && setState((s) => ({ ...s, meta, error: null })))
      .catch(
        (error: unknown) => alive && setState((s) => ({ ...s, error: apiErrorMessage(error) })),
      );
    return () => {
      alive = false;
    };
  }, [state.attempt]);

  return {
    meta: state.meta,
    error: state.error,
    retry: () => setState((s) => ({ ...s, error: null, attempt: s.attempt + 1 })),
  };
}
