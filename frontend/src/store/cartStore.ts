import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/storage';
import { MAX_QTY_PER_LINE } from '../lib/pricing';
import type { AppliedCoupon, CartItem, DeliveryZone, Product } from '../types';

interface CartState {
  items: CartItem[];
  zone: DeliveryZone;
  coupon: AppliedCoupon | null;
  add: (product: Product, size: number, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setZone: (zone: DeliveryZone) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const clampQty = (qty: number) => Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.round(qty)));

/** The cart (model). Saved to localStorage, or kept in memory when storage is unavailable. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      zone: 'inside-dhaka',
      coupon: null,

      add: (product, size, qty) =>
        set((state) => {
          const key = `${product._id}:${size}`;
          const existing = state.items.find((item) => item.key === key);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key ? { ...item, qty: clampQty(item.qty + qty) } : item,
              ),
            };
          }
          const item: CartItem = {
            key,
            productId: product._id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            size,
            qty: clampQty(qty),
            image: product.images?.[0],
            palette: product.palette,
            silhouette: product.silhouette,
          };
          return { items: [item, ...state.items] };
        }),

      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, qty: clampQty(qty) } : item,
          ),
        })),

      remove: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),

      clear: () => set({ items: [], coupon: null }),

      setZone: (zone) => set({ zone }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'stepup:cart',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ items, zone, coupon }) => ({ items, zone, coupon }),
    },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.qty, 0);
