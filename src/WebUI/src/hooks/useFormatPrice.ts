// src/hooks/useFormatPrice.ts
import { useCurrencyStore } from "@/stores/currencyStore";
import { convertPrice, formatPrice } from "@/lib/currency";

export function useFormatPrice() {
  const { currency, rates } = useCurrencyStore();

  return (amountVnd: number | null | undefined): string => {
    if (amountVnd == null) return "—";
    const converted = convertPrice(amountVnd, currency, rates);
    return formatPrice(converted, currency);
  };
}
