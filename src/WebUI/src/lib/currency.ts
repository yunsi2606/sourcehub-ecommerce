// src/lib/currency.ts
export type SupportedCurrency = "VND" | "USD" | "EUR";

const RATES_API = "https://open.er-api.com/v6/latest/VND";

let _cachedRates: Record<string, number> | null = null;
let _cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 giờ

export async function fetchRates(): Promise<Record<string, number>> {
  if (_cachedRates && Date.now() - _cachedAt < CACHE_TTL) return _cachedRates;
  try {
    const res = await fetch(RATES_API);
    const data = await res.json();
    _cachedRates = data.rates;
    _cachedAt = Date.now();
    return _cachedRates || {};
  } catch (error) {
    console.error("Failed to fetch currency rates:", error);
    return {};
  }
}

export function convertPrice(
  amountVnd: number,
  to: SupportedCurrency,
  rates: Record<string, number>
): number {
  if (to === "VND") return amountVnd;
  return amountVnd * (rates[to] ?? 1);
}

export function formatPrice(amount: number, currency: SupportedCurrency): string {
  if (currency === "VND") {
    // VND usually doesn't have decimals and format differently
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency, 
    maximumFractionDigits: 2 
  }).format(amount);
}
