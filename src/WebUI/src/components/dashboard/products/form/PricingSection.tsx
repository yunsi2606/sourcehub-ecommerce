"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { ProductFormData } from "../ProductForm";
import { CustomSelect } from "@/components/ui/select";

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
          <CustomSelect
            value={formData.productType}
            onChange={(val) => onChange({ target: { name: "productType", value: val } } as any)}
            options={[
              { value: "SourceCode", label: t("typeSourceCode") },
              { value: "StandaloneService", label: t("typeService") },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("billingCycle")}</label>
          <CustomSelect
            value={formData.billingCycle || "OneTime"}
            onChange={(val) => onChange({ target: { name: "billingCycle", value: val } } as any)}
            options={[
              { value: "OneTime", label: t("cycleOneTime") },
              { value: "Monthly", label: t("cycleMonthly") },
              { value: "Yearly", label: t("cycleYearly") },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
