"use client";

import { useTranslations } from "next-intl";
import { ProductFormData } from "../ProductForm";

interface Props {
  formData: ProductFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function GeneralInfoSection({ formData, onChange }: Props) {
  const t = useTranslations("ProductForm");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
        {t("generalInfo")}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("productName")}</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={onChange}
            placeholder={t("productNamePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("shortDesc")}</label>
          <textarea
            name="shortDescription"
            required
            rows={2}
            value={formData.shortDescription}
            onChange={onChange}
            placeholder={t("shortDescPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("detailDesc")}</label>
          <textarea
            name="description"
            required
            rows={8}
            value={formData.description}
            onChange={onChange}
            placeholder={t("detailDescPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
