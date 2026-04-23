"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { AlertCircle } from "lucide-react";
import { adminOrderApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { OrderSummary } from "@/types/api";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_DOT: Record<string, string> = {
  Pending: "bg-yellow-500",
  Processing: "bg-blue-500",
  Paid: "bg-emerald-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-red-500",
  Refunded: "bg-slate-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function AdminOrdersPage() {
  const t = useTranslations("Dashboard");
  const accessToken = useAuthStore((s) => s.accessToken);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminOrderApi
      .getAll(accessToken, { page, pageSize: PAGE_SIZE })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders."))
      .finally(() => setIsLoading(false));
  }, [accessToken, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("orders")}</h1>
        <p className="text-slate-500 mt-1">Tất cả đơn hàng trong hệ thống</p>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4 border-b border-slate-100">
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-100 rounded w-20" />
              <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <p className="text-slate-500">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                    <th className="px-6 py-4 font-semibold">Số lượng</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const dotClass = STATUS_DOT[order.status] ?? "bg-slate-400";
                    const badgeClass = STATUS_STYLES[order.status] ?? "bg-slate-50 text-slate-700 border-slate-200";
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-700">
                          #{order.id.split("-")[0].toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4 text-slate-600">{order.itemCount} sản phẩm</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium border ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="font-medium text-primary hover:underline text-sm"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">Trang {page}</span>
            <button
              disabled={orders.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              Sau →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
