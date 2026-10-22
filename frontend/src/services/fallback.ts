import { isUnreachable } from '../lib/api';
import { useConnection } from '../store/connectionStore';

/**
 * Calls the API; if it cannot be reached (or answers with something that is not the data
 * we expect, e.g. an HTML error page), switches the app to the bundled demo data instead.
 * Real API errors (404, 400…) and cancelled requests are passed through unchanged.
 */
export async function withFallback<T>(
  call: () => Promise<T>,
  isValid: (data: unknown) => boolean,
  fallback: () => T,
): Promise<T> {
  try {
    const data = await call();
    if (isValid(data)) return data;
  } catch (error) {
    if (!isUnreachable(error)) throw error;
  }
  useConnection.getState().setOffline();
  return fallback();
}

export const isObject = (data: unknown): data is Record<string, unknown> =>
  !!data && typeof data === 'object';

/** Read requests give up quickly and fall back; the API answers in well under a second. */
export const READ_TIMEOUT = 12000;
