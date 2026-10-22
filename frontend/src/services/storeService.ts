import api from '../lib/api';
import { demoCoupon, demoCreateOrder, demoGetOrder, demoMeta } from '../lib/demoStore';
import { isObject, READ_TIMEOUT, withFallback } from './fallback';
import type { CouponResult, CreateOrderPayload, Meta, Order } from '../types';

let metaRequest: Promise<Meta> | null = null;

/** Store configuration (filters, districts, delivery fees). Fetched once per visit. */
export function getMeta() {
  metaRequest ??= withFallback(
    async () => (await api.get<Meta>('/meta', { timeout: READ_TIMEOUT })).data,
    (data) => isObject(data) && Array.isArray(data.brands),
    () => demoMeta,
  ).catch((error: unknown) => {
    metaRequest = null; // allow a retry
    throw error;
  });
  return metaRequest;
}

/** Checks a code. Resolves null for an unknown code (the API answers 404). */
export async function validateCoupon(code: string, subtotal: number) {
  try {
    return await withFallback(
      async () => (await api.post<CouponResult>('/coupons/validate', { code, subtotal })).data,
      (data) => isObject(data) && 'valid' in data,
      () =>
        demoCoupon(code, subtotal) ?? { valid: false, code, percent: 0, discount: 0, message: '' },
    );
  } catch {
    return null;
  }
}

/**
 * Places a demo order. Only product ids, sizes, quantities, the shipping address, the
 * payment *method* and the coupon code are sent: never card numbers or wallet PINs.
 * If the API is unreachable the order is "placed" in the browser instead (demo only).
 */
export function createOrder(payload: CreateOrderPayload) {
  return withFallback(
    async () => (await api.post<Order>('/orders', payload, { timeout: 25000 })).data,
    (data) => isObject(data) && typeof data.orderNumber === 'string',
    () => demoCreateOrder(payload),
  );
}

/** Looks an order up on the server, then among demo orders placed in this browser. */
export async function getOrder(orderNumber: string, phone: string) {
  const local = () => demoGetOrder(orderNumber, phone);
  try {
    return await withFallback(
      async () =>
        (await api.get<Order>(`/orders/${encodeURIComponent(orderNumber)}`, { params: { phone } }))
          .data,
      (data) => isObject(data) && typeof data.orderNumber === 'string',
      local,
    );
  } catch (error) {
    const found = local(); // offline demo orders are only known to this browser
    if (found) return found;
    throw error;
  }
}

export async function subscribeNewsletter(email: string) {
  return withFallback(
    async () => (await api.post<{ message: string }>('/newsletter', { email })).data,
    (data) => isObject(data) && typeof data.message === 'string',
    () => ({ message: "You're on the list! (Demo mode: the store server is offline.)" }),
  );
}
