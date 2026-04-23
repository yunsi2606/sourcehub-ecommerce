"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronDown, X } from "lucide-react";
import { ProductFormData } from "../ProductForm";
import { Category, Tag } from "@/types/api";

interface Props {
  formData: ProductFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  categories: Category[];
  tags: Tag[];
  isCreatingCategory: boolean;
  setIsCreatingCategory: (val: boolean) => void;
  newCategoryInput: string;
  setNewCategoryInput: (val: string) => void;
  handleCreateCategory: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  newTagInput: string;
  setNewTagInput: (val: string) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleTagToggle: (tagId: string) => void;
}

export function AttributesSection({
  formData,
  onChange,
  categories,
  tags,
  isCreatingCategory,
  setIsCreatingCategory,
  newCategoryInput,
  setNewCategoryInput,
  handleCreateCategory,
  newTagInput,
  setNewTagInput,
  handleTagInputKeyDown,
  handleTagToggle,
}: Props) {
  const t = useTranslations("ProductForm");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
        {t("extendedAttributes")}
      </h2>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">{t("category")}</label>
          <button
            type="button"
            onClick={() => setIsCreatingCategory(!isCreatingCategory)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {isCreatingCategory ? t("cancelCreate") : t("createNew")}
          </button>
        </div>

        {isCreatingCategory ? (
          <input
            type="text"
            autoFocus
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={handleCreateCategory}
            placeholder={t("newCategoryPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-primary bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        ) : (
          <div className="relative">
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{t("tags")}</label>

        <input
          type="text"
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder={t("newTagPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm mb-3"
        />

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
          {tags.map((tag) => {
            const isSelected = formData.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tag.name}
                {isSelected && <X className="w-3 h-3 inline ml-1 opacity-70" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              name="requiresLicense"
              checked={formData.requiresLicense}
              onChange={onChange}
              className="w-5 h-5 appearance-none border-2 border-slate-300 rounded-md checked:bg-primary checked:border-primary transition-all peer cursor-pointer"
            />
            <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{t("requiresLicense")}</p>
            <p className="text-xs text-slate-500">{t("requiresLicenseDesc")}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
