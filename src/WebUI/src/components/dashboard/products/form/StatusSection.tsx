"use client";

import { useTranslations } from "next-intl";
import { ProductFormData } from "../ProductForm";

interface Props {
  formData: ProductFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StatusSection({ formData, onChange }: Props) {
  const t = useTranslations("ProductForm");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
        {t("statusSettings")}
      </h2>

      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{t("publicStatus")}</p>
            <p className="text-xs text-slate-500">{t("publicStatusDesc")}</p>
          </div>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group pt-4 border-t border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{t("featuredStatus")}</p>
            <p className="text-xs text-slate-500">{t("featuredStatusDesc")}</p>
          </div>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={onChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
      </div>
    </div>
  );
}
