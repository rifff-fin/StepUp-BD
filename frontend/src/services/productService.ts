import api from '../lib/api';
import { demoProducts } from '../lib/demoStore';
import { isObject, READ_TIMEOUT, withFallback } from './fallback';
import type { CatalogFilters, ProductListResponse } from '../types';

/** Turns the UI filters into the API's query string (only non-default values). */
export function toQuery(filters: Partial<CatalogFilters>) {
  const params: Record<string, string> = {};
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.category && filters.category !== 'All') params.category = filters.category;
  if (filters.brands?.length) params.brand = filters.brands.join(',');
  if (filters.sizes?.length) params.size = filters.sizes.join(',');
  if (filters.colors?.length) params.color = filters.colors.join(',');
  if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
  if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
  if (filters.sort) params.sort = filters.sort;
  return params;
}

const isProductList = (data: unknown) => isObject(data) && Array.isArray(data.products);

/** GET /api/products with query params built by `toQuery`. */
export function getProducts(params: Record<string, string>, signal?: AbortSignal) {
  return withFallback(
    async () =>
      (await api.get<ProductListResponse>('/products', { params, signal, timeout: READ_TIMEOUT }))
        .data,
    isProductList,
    () => demoProducts(params),
  );
}

export async function getTrending(limit = 10, signal?: AbortSignal) {
  const data = await getProducts(
    { trending: 'true', sort: 'popular', limit: String(limit) },
    signal,
  );
  return data.products;
}
