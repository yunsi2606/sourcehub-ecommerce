"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";
import { categoryApi, tagApi } from "@/lib/api/catalog";
import { useAuthStore } from "@/stores/authStore";
import { Category, Tag, CreateProductRequest } from "@/types/api";

import { GeneralInfoSection } from "./form/GeneralInfoSection";
import { PricingSection } from "./form/PricingSection";
import { StatusSection } from "./form/StatusSection";
import { AttributesSection } from "./form/AttributesSection";
import { ResourcesSection } from "./form/ResourcesSection";

export type ProductFormData = CreateProductRequest & {
  isActive?: boolean;
  isFeatured?: boolean;
  thumbnailUrl?: string | null;
  thumbnailFile?: File;
};

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEdit?: boolean;
}

export function ProductForm({ initialData, onSubmit, isEdit = false }: ProductFormProps) {
  const t = useTranslations("ProductForm");
  const tError = useTranslations("ErrorMessages");
  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [newTagInput, setNewTagInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnailUrl ?? null);

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    salePrice: initialData?.salePrice ?? null,
    productType: initialData?.productType ?? "SourceCode",
    billingCycle: initialData?.billingCycle ?? "OneTime",
    categoryId: initialData?.categoryId ?? "",
    requiresLicense: initialData?.requiresLicense ?? false,
    demoUrl: initialData?.demoUrl ?? "",
    techStack: initialData?.techStack ?? "",
    tagIds: initialData?.tagIds ?? [],
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    thumbnailUrl: initialData?.thumbnailUrl,
    thumbnailFile: initialData?.thumbnailFile,
  });

  useEffect(() => {
    Promise.all([categoryApi.getAll(), tagApi.getAll()]).then(
      ([catRes, tagRes]) => {
        setCategories(catRes);
        setTags(tagRes);
        if (catRes.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes[0].id }));
        }
        setLoadingInitial(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "price" || name === "salePrice") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateCategory = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCategoryInput.trim() !== "" && accessToken) {
      e.preventDefault();
      try {
        const newCat = await categoryApi.create(newCategoryInput.trim(), accessToken);
        setCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, categoryId: newCat.id }));
        setNewCategoryInput("");
        setIsCreatingCategory(false);
      } catch (err: any) {
        setError(err.message || "Lỗi tạo danh mục");
      }
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.tagIds.includes(tagId);
      if (isSelected) {
        return { ...prev, tagIds: prev.tagIds.filter((id) => id !== tagId) };
      } else {
        return { ...prev, tagIds: [...prev.tagIds, tagId] };
      }
    });
  };

  const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagInput.trim() !== "" && accessToken) {
      e.preventDefault();
      const tagName = newTagInput.trim();
      let existingTag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
      if (!existingTag) {
        try {
          existingTag = await tagApi.create(tagName, accessToken);
          setTags((prev) => [...prev, existingTag!]);
        } catch (err: any) {
          setError(err.message || "Lỗi tạo tag mới");
          return;
        }
      }
      if (!formData.tagIds.includes(existingTag.id)) {
        setFormData((prev) => ({ ...prev, tagIds: [...prev.tagIds, existingTag!.id] }));
      }
      setNewTagInput("");
    }
  };

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(tError("failImageSize"));
      return;
    }

    if (!accessToken) {
      setError(tError("failLogin"));
      return;
    }

    try {
      setIsUploadingFile(true);
      setError("");

      // Import dynamic to avoid circular dependency issues if any
      const { fileApi } = await import("@/lib/api/files");
      const res = await fileApi.uploadTemp(file, accessToken);

      setThumbnailPreview(res.fullUrl);
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: res.url,
        thumbnailFile: undefined // Clear this so parent doesn't upload again
      }));
    } catch (err: any) {
      setError(tError("failUploadImage"));
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(tError("failSaveProduct"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? t("editTitle") : t("createTitle")}
            </h1>
            <p className="text-sm text-slate-500">
              {isEdit ? t("editSubtitle") : t("createSubtitle")}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-10 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? t("saveEdit") : t("saveCreate")}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfoSection formData={formData} onChange={handleChange} />
          <PricingSection formData={formData} onChange={handleChange} />
        </div>

        <div className="space-y-6">
          {isEdit && <StatusSection formData={formData} onChange={handleChange} />}
          
          <AttributesSection
            formData={formData}
            onChange={handleChange}
            categories={categories}
            tags={tags}
            isCreatingCategory={isCreatingCategory}
            setIsCreatingCategory={setIsCreatingCategory}
            newCategoryInput={newCategoryInput}
            setNewCategoryInput={setNewCategoryInput}
            handleCreateCategory={handleCreateCategory}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            handleTagInputKeyDown={handleTagInputKeyDown}
            handleTagToggle={handleTagToggle}
          />

          <ResourcesSection
            formData={formData}
            onChange={handleChange}
            isUploadingFile={isUploadingFile}
            thumbnailPreview={thumbnailPreview}
            isDragging={isDragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
          />
        </div>
      </form>
    </div>
  );
}
