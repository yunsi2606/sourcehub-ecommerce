"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/stores/authStore";
import { orderApi } from "@/lib/api";
import { OrderDetail } from "@/types/api";
import { useFormatPrice } from "@/hooks/useFormatPrice";

import { useTranslations } from "next-intl";

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />;
}

function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const accessToken = useAuthStore((s) => s.accessToken);
  const formatPrice = useFormatPrice();
  const t = useTranslations("Checkout");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !accessToken) {
      setLoading(false);
      return;
    }
    orderApi
      .getDetail(orderId, accessToken)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId, accessToken]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg w-full text-center shadow-sm">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          {orderId ? t("orderSuccessTitle") : t("success")}
        </h1>
        <p className="text-slate-500 mb-8">
          {orderId ? t("orderSuccessDesc") : t("successDesc")}
        </p>

        {/* Order Summary */}
        {loading ? (
          <div className="bg-slate-50 rounded-2xl p-4 mb-8 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-5 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        ) : order ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wide font-bold">
              <span>{t("orderId")}</span>
              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.productThumbnail ? (
                      <img
                        src={item.productThumbnail}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {item.productTitle}
                  </span>
                  <span className="text-sm font-bold text-slate-900 shrink-0">
                    {formatPrice(item.priceAtPurchase)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>{t("totalAmount")}</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ) : null}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          {order && (
            <Link
              href={`/profile`}
              className="h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft text-sm"
            >
              {t("viewOrder")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/"
            className="h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-all text-sm"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
