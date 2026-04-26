"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrencyStore } from "@/stores/currencyStore";
import { SupportedCurrency } from "@/lib/currency";
import { ChevronDown, Check } from "lucide-react";

const CURRENCIES: { value: SupportedCurrency; label: string; icon: string }[] = [
  { value: "VND", label: "VND", icon: "₫" },
  { value: "USD", label: "USD", icon: "$" },
  { value: "EUR", label: "EUR", icon: "€" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCurrency = CURRENCIES.find((c) => c.value === currency) || CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
      >
        <span className="text-slate-500 font-bold">{activeCurrency.icon}</span>
        {activeCurrency.label}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCurrency(c.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                currency === c.value ? "text-primary font-medium bg-primary/5" : "text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-left font-bold text-slate-400">{c.icon}</span>
                {c.label}
              </div>
              {currency === c.value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
