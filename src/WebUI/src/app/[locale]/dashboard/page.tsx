"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, Code2, Cpu, ShoppingBag } from "lucide-react";
import { adminOrderApi, adminProductApi, adminServiceProjectApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { OrderSummary, ProductSummary, ServiceProjectDto } from "@/types/api";
import { useFormatPrice } from "@/hooks/useFormatPrice";

export default function DashboardOverview() {
  const t = useTranslations("Dashboard");
  const { user, accessToken } = useAuthStore();
  const formatPrice = useFormatPrice();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [services, setServices] = useState<ServiceProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    Promise.allSettled([
      adminOrderApi.getAll(accessToken, { pageSize: 5 }),
      adminProductApi.getList(accessToken, { pageSize: 1 }),   // chỉ cần totalCount
      adminServiceProjectApi.getAll(accessToken),
    ]).then(([ordersRes, productsRes, servicesRes]) => {
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value);
      if (productsRes.status === "fulfilled") setProducts(productsRes.value.items);
      if (servicesRes.status === "fulfilled") setServices(servicesRes.value);
      setLoading(false);
    });
  }, [accessToken]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeServices = services.filter((s) => s.status === "InProgress" || s.status === "Pending").length;

  const Skeleton = ({ w }: { w: string }) => (
    <span className={`inline-block h-7 ${w} bg-slate-100 rounded animate-pulse`} />
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t("welcome")}, {user?.fullName ?? "Admin"}!
        </h1>
        <p className="text-slate-500 mt-1">{t("welcomeDesc")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Doanh thu gần đây</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {loading ? <Skeleton w="w-24" /> : formatPrice(totalRevenue)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">5 đơn hàng gần nhất</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Đơn hàng mới</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {loading ? <Skeleton w="w-10" /> : orders.filter((o) => o.status === "Pending").length}
          </h3>
          <Link href="/dashboard/orders" className="text-xs text-primary hover:underline mt-1 block">
            Xem tất cả →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Dịch vụ đang chạy</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {loading ? <Skeleton w="w-10" /> : activeServices}
          </h3>
          <Link href="/dashboard/services" className="text-xs text-primary hover:underline mt-1 block">
            Xem tất cả →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h2>
          <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-slate-400 text-sm">Chưa có đơn hàng nào</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm font-mono">#{order.id.split("-")[0].toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{order.itemCount} sản phẩm · {order.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900 text-sm">{formatPrice(order.totalAmount)}</span>
                  <Link href={`/dashboard/orders/${order.id}`} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
