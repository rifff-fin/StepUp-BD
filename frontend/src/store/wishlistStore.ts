import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/storage';
import type { Product } from '../types';

interface WishlistState {
  /** Saved products (whole product, so the quick view can reopen from the wishlist). */
  items: Product[];
  /** Adds or removes; returns true when the product is now in the wishlist. */
  toggle: (product: Product) => boolean;
  remove: (productId: string) => void;
}

/** The wishlist (model). Saved like the cart. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((item) => item._id === product._id);
        set((state) => ({
          items: exists
            ? state.items.filter((item) => item._id !== product._id)
            : [product, ...state.items],
        }));
        return !exists;
      },

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item._id !== productId) })),
    }),
    {
      name: 'stepup:wishlist',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      // v1 stored a slimmer shape; start fresh rather than show broken entries
      migrate: () => ({ items: [] }),
    },
  ),
);

export const useIsWished = (productId: string) =>
  useWishlist((state) => state.items.some((item) => item._id === productId));
