import { create } from 'zustand';
import type { Product } from '../types';

export type Panel = 'cart' | 'wishlist' | 'filters' | 'menu' | null;

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

interface UiState {
  /** One side panel at a time (cart, wishlist, mobile filters, mobile menu). */
  panel: Panel;
  quickView: Product | null;
  checkoutOpen: boolean;
  toasts: Toast[];
  /** Bumped to replay the navbar badge animations. */
  cartPulse: number;
  wishPulse: number;

  openPanel: (panel: Exclude<Panel, null>) => void;
  closePanel: () => void;
  togglePanel: (panel: Exclude<Panel, null>) => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  pulseCart: () => void;
  pulseWish: () => void;
}

let toastId = 0;

export const useUi = create<UiState>()((set, get) => ({
  panel: null,
  quickView: null,
  checkoutOpen: false,
  toasts: [],
  cartPulse: 0,
  wishPulse: 0,

  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  togglePanel: (panel) => set({ panel: get().panel === panel ? null : panel }),
  openQuickView: (product) => set({ quickView: product, panel: null }),
  closeQuickView: () => set({ quickView: null }),
  openCheckout: () => set({ checkoutOpen: true, panel: null, quickView: null }),
  closeCheckout: () => set({ checkoutOpen: false }),

  toast: (message, tone = 'success') => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone }] }));
    window.setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  pulseCart: () => set((state) => ({ cartPulse: state.cartPulse + 1 })),
  pulseWish: () => set((state) => ({ wishPulse: state.wishPulse + 1 })),
}));

/** True while anything covers the page (scroll is locked then). */
export const selectOverlayOpen = (state: UiState) =>
  (state.panel !== null && state.panel !== 'menu') || !!state.quickView || state.checkoutOpen;
