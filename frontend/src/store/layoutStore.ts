import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isMobileMode: boolean;
  toggleMobileMode: () => void;
  setMobileMode: (val: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isMobileMode: false,
      toggleMobileMode: () => set((state) => ({ isMobileMode: !state.isMobileMode })),
      setMobileMode: (val) => set({ isMobileMode: val }),
    }),
    {
      name: 'layout-storage',
    }
  )
);
