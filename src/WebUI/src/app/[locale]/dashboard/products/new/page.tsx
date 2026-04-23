"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { adminProductApi } from "@/lib/api/products";
import { useAuthStore } from "@/stores/authStore";
import { ProductForm, ProductFormData } from "@/components/dashboard/products/ProductForm";
import { X } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [error, setError] = useState("");

  const handleSubmit = async (formData: ProductFormData) => {
    if (!accessToken) return;
    setError("");
    try {
      await adminProductApi.create(formData, accessToken);
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo sản phẩm.");
      throw err; // rethrow so the form button stops spinning if we handle it there, but here we can just throw
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="max-w-5xl mx-auto p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} isEdit={false} />
    </div>
  );
}
