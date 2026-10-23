// Shapes shared by the API (backend/models) and the UI.

export type Silhouette = 'low' | 'high' | 'runner';

/** Colours of one sneaker: the drawn product image and the 3D shoe both read these. */
export interface Palette {
  upper: string;
  overlay: string;
  stripe: string;
  midsole: string;
  outsole: string;
  laces: string;
  tab: string;
  collar: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  silhouette: Silhouette;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  sizes: number[];
  colors: string[];
  palette: Palette;
  /** Photo paths; the first is the main photo (see ProductPhoto for thumbnails). */
  images: string[];
  description: string;
  popularity: number;
  isNewArrival: boolean;
  trending: boolean;
  /** Hidden from the store when false (admin only sees these). */
  active?: boolean;
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  facets: { brands: Record<string, number> };
}

export type DeliveryZone = 'inside-dhaka' | 'outside-dhaka';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';
export type WalletMethod = Extract<PaymentMethod, 'bkash' | 'nagad' | 'rocket'>;
export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'new';

export interface Meta {
  brands: string[];
  categories: string[];
  colors: { name: string; hex: string }[];
  sizes: number[];
  priceRange: { min: number; max: number };
  currency: { code: string; symbol: string };
  divisions: Record<string, string[]>;
  delivery: {
    fees: Record<DeliveryZone, number>;
    days: Record<DeliveryZone, { from: number; to: number }>;
  };
  maxQtyPerLine: number;
}

export interface CatalogFilters {
  q: string;
  category: string; // 'All' or a category
  brands: string[];
  sizes: number[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sort: SortKey;
}

/** A cart line: one product in one size. Product fields are a snapshot for display only. */
export interface CartItem {
  key: string; // `${productId}:${size}`
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  size: number;
  qty: number;
  image?: string;
  palette: Palette;
  silhouette: Silhouette;
}

export interface AppliedCoupon {
  code: string;
  percent: number;
}

export interface CouponResult extends AppliedCoupon {
  valid: boolean;
  discount: number;
  message: string;
  description?: string;
}

export interface ShippingDetails {
  name: string;
  phone: string;
  address: string;
  district: string;
  note: string;
}

export interface OrderItem {
  product: string;
  slug: string;
  name: string;
  brand: string;
  size: number;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shipping: ShippingDetails & { division: string };
  deliveryZone: DeliveryZone;
  payment: { method: PaymentMethod; status: 'demo-paid' | 'cod-pending' };
  pricing: {
    subtotal: number;
    couponCode: string | null;
    discount: number;
    deliveryFee: number;
    total: number;
  };
  estimatedDelivery: { from: string; to: string };
  status: string;
  isDemo: boolean;
  createdAt: string;
}

export interface CreateOrderPayload {
  items: { productId: string; size: number; qty: number }[];
  shipping: ShippingDetails;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
}
