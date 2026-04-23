'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  thumbnailUrl: string | null;
  addons: CartAddon[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  toggleAddon: (productId: string, addon: CartAddon) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.productId === item.productId);
          if (exists) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      toggleAddon: (productId, addon) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId) return item;
            const hasAddon = item.addons.some((a) => a.id === addon.id);
            return {
              ...item,
              addons: hasAddon
                ? item.addons.filter((a) => a.id !== addon.id)
                : [...item.addons, addon],
            };
          }),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-store' }
  )
);
