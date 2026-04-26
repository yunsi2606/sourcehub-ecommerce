"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/stores/currencyStore";
import { fetchRates } from "@/lib/currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const setRates = useCurrencyStore((s) => s.setRates);

  useEffect(() => {
    fetchRates().then(setRates).catch(console.error);
  }, [setRates]);

  return <>{children}</>;
}
