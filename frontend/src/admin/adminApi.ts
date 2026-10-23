import axios from 'axios';
import { create } from 'zustand';
import { API_BASE_URL } from '../lib/api';
import type { Order, Product } from '../types';

/**
 * Admin API client. The token lives in sessionStorage (gone when the tab closes); a 401
 * from the server logs the admin out.
 */
const TOKEN_KEY = 'stepup:admin-token';

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

interface AuthState {
  token: string | null;
  email: string | null;
  setSession: (token: string, email: string) => void;
  logout: () => void;
}

export const useAdminAuth = create<AuthState>()((set) => ({
  token: readToken(),
  email: null,
  setSession: (token, email) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* private mode: the session lasts until reload */
    }
    set({ token, email });
  },
  logout: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    set({ token: null, email: null });
  },
}));

const http = axios.create({ baseURL: `${API_BASE_URL}/admin`, timeout: 30000 });

http.interceptors.request.use((config) => {
  const token = useAdminAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use(undefined, (error) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.url !== '/login'
  ) {
    useAdminAuth.getState().logout();
  }
  return Promise.reject(error);
});

export interface AdminStats {
  products: number;
  activeProducts: number;
  subscribers: number;
  orders: Record<string, number>;
  revenue: number;
  paidOrders: number;
  daily: { _id: string; orders: number; revenue: number }[];
  recent: Order[];
}

export interface Coupon {
  _id: string;
  code: string;
  percent: number;
  description?: string;
  active: boolean;
  expiresAt: string | null;
}

export interface Subscriber {
  _id: string;
  email: string;
  source: string;
  createdAt: string;
}

export type ProductInput = Partial<Omit<Product, '_id' | 'discountPercent' | 'createdAt'>>;

export const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const data = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export const adminApi = {
  login: (email: string, password: string) =>
    data<{ token: string; email: string }>(http.post('/login', { email, password })),
  me: () => data<{ email: string }>(http.get('/me')),
  stats: () => data<AdminStats>(http.get('/stats')),

  products: (q = '') => data<Product[]>(http.get('/products', { params: { q } })),
  createProduct: (input: ProductInput) => data<Product>(http.post('/products', input)),
  updateProduct: (id: string, input: ProductInput) =>
    data<Product>(http.put(`/products/${id}`, input)),
  deleteProduct: (id: string) => data<{ deleted: string }>(http.delete(`/products/${id}`)),

  orders: (params: { status?: string; q?: string } = {}) =>
    data<Order[]>(http.get('/orders', { params })),
  setOrderStatus: (id: string, status: string) =>
    data<Order>(http.patch(`/orders/${id}`, { status })),

  coupons: () => data<Coupon[]>(http.get('/coupons')),
  createCoupon: (input: Partial<Coupon>) => data<Coupon>(http.post('/coupons', input)),
  updateCoupon: (id: string, input: Partial<Coupon>) =>
    data<Coupon>(http.put(`/coupons/${id}`, input)),
  deleteCoupon: (id: string) => data<{ deleted: string }>(http.delete(`/coupons/${id}`)),

  subscribers: () => data<Subscriber[]>(http.get('/subscribers')),
  deleteSubscriber: (id: string) => data<{ deleted: string }>(http.delete(`/subscribers/${id}`)),

  /**
   * Uploads one image straight to Cloudinary with a one-time signature from the API (the
   * API secret never reaches the browser). Returns the image's https URL.
   */
  async uploadImage(file: File) {
    const sign = await data<{
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    }>(http.post('/uploads/sign'));
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('folder', sign.folder);
    form.append('signature', sign.signature);
    const res = await axios.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      form,
    );
    return res.data.secure_url;
  },
};
