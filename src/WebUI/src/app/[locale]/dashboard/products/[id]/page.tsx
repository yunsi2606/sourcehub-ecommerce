"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { adminProductApi } from "@/lib/api/products";
import { categoryApi, tagApi } from "@/lib/api/catalog";
import { useAuthStore } from "@/stores/authStore";
import { ProductForm, ProductFormData } from "@/components/dashboard/products/ProductForm";
import { AddonsSection } from "@/components/dashboard/products/form/AddonsSection";
import { FilesSection } from "@/components/dashboard/products/form/FilesSection";
import { useTranslations } from "next-intl";
import { ProductFile } from "@/types/api";

export default function EditProductPage() {
  const t = useTranslations("ErrorMessages");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { accessToken } = useAuthStore();
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<ProductFormData>>();
  const [initialFiles, setInitialFiles] = useState<ProductFile[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      categoryApi.getAll(),
      tagApi.getAll(),
      adminProductApi.getById(productId, accessToken)
    ]).then(([catRes, tagRes, productRes]) => {
      // Match tag names to tag IDs
      const productTagIds = productRes.tags
        .map(tagName => tagRes.find(t => t.name === tagName)?.id)
        .filter(Boolean) as string[];

      setInitialData({
        title: productRes.title,
        shortDescription: productRes.shortDescription,
        description: productRes.description,
        price: productRes.price,
        salePrice: productRes.salePrice,
        productType: productRes.productType,
        billingCycle: productRes.billingCycle,
        categoryId: productRes.categoryId,
        requiresLicense: productRes.requiresLicense,
        demoUrl: productRes.demoUrl,
        techStack: productRes.techStack,
        tagIds: productTagIds,
        isActive: productRes.isActive,
        isFeatured: productRes.isFeatured,
        thumbnailUrl: productRes.thumbnailUrl,
      });
      setInitialFiles(productRes.files || []);
      setLoadingInitial(false);
    }).catch(err => {
      setError(t("failLoadProduct"));
      setLoadingInitial(false);
    });
  }, [accessToken, productId]);

  const handleSubmit = async (formData: ProductFormData) => {
    if (!accessToken) return;
    setError("");
    try {
      await adminProductApi.update(productId, formData, accessToken);
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(t("failSaveProduct"));
      throw err;
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
    <div className="space-y-4">
      {error && (
        <div className="max-w-5xl mx-auto p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}
      <ProductForm initialData={initialData} onSubmit={handleSubmit} isEdit={true} />

      {/* These sections only make sense AFTER the product exists */}
      {accessToken && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FilesSection productId={productId} token={accessToken} initialFiles={initialFiles} />
          <AddonsSection productId={productId} token={accessToken} />
        </div>
      )}
    </div>
  );
}
