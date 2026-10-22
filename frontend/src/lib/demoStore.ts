import snapshot from '../content/demoCatalog.json';
import { deliveryZoneFor, DELIVERY_FEES } from './pricing';
import { safeStorage } from './storage';
import type {
  CouponResult,
  CreateOrderPayload,
  Meta,
  Order,
  Product,
  ProductListResponse,
} from '../types';

/**
 * Offline stand-in for the API, built on the catalog snapshot that
 * backend/scripts/exportDemoCatalog.js writes. Used only when the API cannot be reached,
 * so the demo store keeps working (and is never empty). Mirrors the backend controllers.
 */
const products = snapshot.products as unknown as Product[];
export const demoMeta = snapshot.meta as unknown as Meta;

const SORTS: Record<string, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.popularity - a.popularity || b.rating - a.rating,
  'price-asc': (a, b) => a.price - b.price || b.popularity - a.popularity,
  'price-desc': (a, b) => b.price - a.price || b.popularity - a.popularity,
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

const list = (value?: string) => (value ? value.split(',').filter(Boolean) : []);

function matches(p: Product, params: Record<string, string>, omitBrand = false) {
  const brands = list(params.brand);
  if (!omitBrand && brands.length && !brands.includes(p.brand)) return false;
  if (params.category && params.category !== 'All' && p.category !== params.category) return false;
  if (params.minPrice && p.price < Number(params.minPrice)) return false;
  if (params.maxPrice && p.price > Number(params.maxPrice)) return false;
  const sizes = list(params.size).map(Number);
  if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false;
  const colors = list(params.color);
  if (colors.length && !colors.some((c) => p.colors.includes(c))) return false;
  if (params.trending === 'true' && !p.trending) return false;
  const words = (params.q || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function demoProducts(params: Record<string, string>): ProductListResponse {
  const found = products
    .filter((p) => matches(p, params))
    .sort(SORTS[params.sort] || SORTS.popular)
    .slice(0, Number(params.limit) || 100);

  const brands = Object.fromEntries(demoMeta.brands.map((b) => [b, 0]));
  products.filter((p) => matches(p, params, true)).forEach((p) => (brands[p.brand] += 1));

  return { products: found, total: found.length, facets: { brands } };
}

export function demoCoupon(code: string, subtotal: number): CouponResult | null {
  const coupon = snapshot.coupons.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return null;
  return {
    valid: true,
    code: coupon.code,
    percent: coupon.percent,
    discount: Math.round((subtotal * coupon.percent) / 100),
    message: `${coupon.code} applied: ${coupon.percent}% off`,
  };
}

// Demo orders placed offline are kept in this browser so "Track order" can find them
const ORDERS_KEY = 'stepup:demo-orders';

function savedOrders(): Order[] {
  try {
    return JSON.parse((safeStorage.getItem(ORDERS_KEY) as string | null) || '[]') as Order[];
  } catch {
    return [];
  }
}

export function demoCreateOrder(payload: CreateOrderPayload): Order {
  const items = payload.items.map((item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) throw new Error('An item in your cart is no longer available.');
    return {
      product: product._id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      size: item.size,
      qty: item.qty,
      unitPrice: product.price,
      lineTotal: product.price * item.qty,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const coupon = payload.couponCode ? demoCoupon(payload.couponCode, subtotal) : null;
  const discount = coupon?.discount ?? 0;
  const deliveryZone = deliveryZoneFor(payload.shipping.district);
  const deliveryFee = DELIVERY_FEES[deliveryZone];
  const days = demoMeta.delivery.days[deliveryZone];
  const addDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString();
  const division =
    Object.entries(demoMeta.divisions).find(([, districts]) =>
      districts.includes(payload.shipping.district),
    )?.[0] ?? '';

  const order: Order = {
    _id: `demo-${Date.now()}`,
    orderNumber: `SUBD-${Math.floor(10000 + Math.random() * 90000)}`,
    items,
    shipping: { ...payload.shipping, division },
    deliveryZone,
    payment: {
      method: payload.paymentMethod,
      status: payload.paymentMethod === 'cod' ? 'cod-pending' : 'demo-paid',
    },
    pricing: {
      subtotal,
      couponCode: coupon?.code ?? null,
      discount,
      deliveryFee,
      total: subtotal - discount + deliveryFee,
    },
    estimatedDelivery: { from: addDays(days.from), to: addDays(days.to) },
    status: 'placed',
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  safeStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...savedOrders()].slice(0, 20)));
  return order;
}

export function demoGetOrder(orderNumber: string, phone: string): Order | null {
  return (
    savedOrders().find(
      (order) => order.orderNumber === orderNumber.toUpperCase() && order.shipping.phone === phone,
    ) ?? null
  );
}
