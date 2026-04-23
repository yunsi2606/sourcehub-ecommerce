"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Box, Code2, AlertCircle, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { adminProductApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ProductSummary } from "@/types/api";

const TYPE_BADGE: Record<string, string> = {
  SourceCode: "bg-indigo-50 text-indigo-700 border-indigo-200",
  StandaloneService: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function AdminProductsPage() {
  const t = useTranslations("Dashboard");
  const accessToken = useAuthStore((s) => s.accessToken);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminProductApi
      .getList(accessToken, { page, pageSize: PAGE_SIZE })
      .then((res) => {
        setProducts(res.items);
        setTotal(res.totalCount);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products."))
      .finally(() => setIsLoading(false));
  }, [accessToken, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("products")}</h1>
          <p className="text-slate-500 mt-1">
            {total > 0 ? `${total} sản phẩm` : "Quản lý tất cả sản phẩm"}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft flex items-center gap-2 text-sm"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Box className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có sản phẩm nào</h3>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                    <th className="px-6 py-4 font-semibold">Loại</th>
                    <th className="px-6 py-4 font-semibold">Giá</th>
                    <th className="px-6 py-4 font-semibold">Danh mục</th>
                    <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center shrink-0">
                            {p.thumbnailUrl
                              ? <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover rounded-xl" />
                              : <Code2 className="w-5 h-5 text-indigo-500" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-slate-400">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${TYPE_BADGE[p.productType] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {p.productType === "SourceCode" ? "Source Code" : "Service"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {p.salePrice ? (
                          <span>
                            {formatCurrency(p.salePrice)}{" "}
                            <span className="text-xs text-slate-400 line-through">{formatCurrency(p.price)}</span>
                          </span>
                        ) : formatCurrency(p.price)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.categoryName}</td>
                      <td className="px-6 py-4 text-center">
                        {p.isActive
                          ? <ToggleRight className="w-5 h-5 text-emerald-500 inline" />
                          : <ToggleLeft className="w-5 h-5 text-slate-300 inline" />
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/products/${p.id}`}
                          className="text-primary hover:underline font-medium text-sm inline-flex items-center gap-1"
                        >
                          Sửa <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                ← Trước
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Trang {page} / {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                disabled={page >= Math.ceil(total / PAGE_SIZE)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
