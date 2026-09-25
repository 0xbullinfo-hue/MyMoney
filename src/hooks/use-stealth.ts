'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StealthState {
  stealthModeEnabled: boolean;
  globalCardFreeze: boolean;
  toggleStealthMode: () => void;
  toggleGlobalCardFreeze: () => void;
  formatCurrency: (amount: number, currency?: 'NGN' | 'USD') => string;
}

export const useStealth = create<StealthState>()(
  persist(
    (set, get) => ({
      stealthModeEnabled: false,
      globalCardFreeze: false,
      toggleStealthMode: () => set((state) => ({ stealthModeEnabled: !state.stealthModeEnabled })),
      toggleGlobalCardFreeze: () => set((state) => ({ globalCardFreeze: !state.globalCardFreeze })),
      formatCurrency: (amount: number, currency = 'NGN') => {
        if (get().stealthModeEnabled) {
          return `${currency === 'NGN' ? '₦' : '$'} •••,•••,•••.••`;
        }
        return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
        }).format(amount);
      },
    }),
    {
      name: 'mymoney-stealth-vault',
      version: 1,
      // Only persist serializable flags — never functions or derived state.
      partialize: (state) => ({
        stealthModeEnabled: state.stealthModeEnabled,
        globalCardFreeze: state.globalCardFreeze,
      }),
    }
  )
);
