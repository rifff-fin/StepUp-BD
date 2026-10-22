import { create } from 'zustand';

/** True once the app had to fall back to the bundled demo catalog (API unreachable). */
export const useConnection = create<{ offline: boolean; setOffline: () => void }>()((set) => ({
  offline: false,
  setOffline: () => set({ offline: true }),
}));
