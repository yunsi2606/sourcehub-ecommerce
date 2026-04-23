"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, UploadCloud } from "lucide-react";
import { ProductFormData } from "../ProductForm";

interface Props {
  formData: ProductFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingFile: boolean;
  thumbnailPreview: string | null;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (file: File | undefined) => void;
}

export function ResourcesSection({
  formData,
  onChange,
  isUploadingFile,
  thumbnailPreview,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
}: Props) {
  const t = useTranslations("ProductForm");

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
        {t("resources")}
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{t("thumbnail")}</label>
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer block relative overflow-hidden ${
            isDragging ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50 hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />

          {isUploadingFile ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-900">Đang upload ảnh...</p>
            </div>
          ) : thumbnailPreview ? (
            <>
              <img src={thumbnailPreview} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                <Check className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-900">Đã chọn ảnh</p>
                <p className="text-xs text-slate-500 mt-1">Bấm hoặc kéo thả để đổi ảnh khác</p>
              </div>
            </>
          ) : (
            <>
              <UploadCloud className={`w-8 h-8 mb-3 ${isDragging ? "text-primary" : "text-slate-400"}`} />
              <p className="text-sm font-medium text-slate-900">{t("thumbnailDrag")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("thumbnailHint")}</p>
            </>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t("demoUrl")}</label>
        <input
          type="url"
          name="demoUrl"
          value={formData.demoUrl || ""}
          onChange={onChange}
          placeholder={t("demoUrlPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t("techStack")}</label>
        <input
          type="text"
          name="techStack"
          value={formData.techStack || ""}
          onChange={onChange}
          placeholder={t("techStackPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        />
      </div>
    </div>
  );
}
