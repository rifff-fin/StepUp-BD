import axios, { isAxiosError, isCancel } from 'axios';

/**
 * One axios instance for the whole app. Requests go to /api on the page's own origin:
 * Vite proxies it to the local API in development (vite.config.ts) and Netlify proxies it
 * to Render in production (netlify.toml). VITE_API_BASE_URL overrides this.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

// Generous timeout: a sleeping free-tier server can take a while to wake up
const api = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

export default api;

export const isAborted = (error: unknown) => isCancel(error);

/**
 * True when the API could not be reached at all (offline, timed out, server down, or the
 * host answered with a non-JSON error page) as opposed to a real answer like "404 product
 * not found" or "400 invalid phone". Only then do the services fall back to demo data.
 */
export function isUnreachable(error: unknown) {
  if (!isAxiosError(error) || isCancel(error)) return false;
  if (!error.response) return true;
  const { status, headers } = error.response;
  const isJson = String(headers['content-type'] ?? '').includes('application/json');
  return status >= 500 || !isJson;
}

/** A message that is safe to show to the shopper. */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to answer. Please try again.';
    }
    if (!error.response) return 'No connection to the store. Check your internet and try again.';
  }
  return fallback;
}

/** Field errors from a 400 response ({ errors: { phone: '...' } }). */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string> } | undefined;
    if (data?.errors) return data.errors;
  }
  return {};
}
