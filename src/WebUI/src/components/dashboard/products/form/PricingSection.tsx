"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { ProductFormData } from "../ProductForm";

interface Props {
  formData: ProductFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function PricingSection({ formData, onChange }: Props) {
  const t = useTranslations("ProductForm");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
        {t("pricingCategory")}
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("price")}</label>
          <input
            type="number"
            name="price"
            required
            min={0}
            value={formData.price}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("salePrice")}</label>
          <input
            type="number"
            name="salePrice"
            min={0}
            value={formData.salePrice ?? ""}
            onChange={onChange}
            placeholder={t("salePricePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("productType")}</label>
          <div className="relative">
            <select
              name="productType"
              value={formData.productType}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
            >
              <option value="SourceCode">{t("typeSourceCode")}</option>
              <option value="StandaloneService">{t("typeService")}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("billingCycle")}</label>
          <div className="relative">
            <select
              name="billingCycle"
              value={formData.billingCycle || ""}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
            >
              <option value="OneTime">{t("cycleOneTime")}</option>
              <option value="Monthly">{t("cycleMonthly")}</option>
              <option value="Yearly">{t("cycleYearly")}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
