// src/stores/currencyStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SupportedCurrency } from "@/lib/currency";

interface CurrencyState {
  currency: SupportedCurrency;
  rates: Record<string, number>;
  setCurrency: (c: SupportedCurrency) => void;
  setRates: (r: Record<string, number>) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "VND",
      rates: {},
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) => set({ rates }),
    }),
    { name: "currency-store" } // persist sang localStorage
  )
);
