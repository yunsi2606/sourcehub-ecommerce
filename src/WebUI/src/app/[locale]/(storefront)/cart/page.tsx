"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const { items, removeItem, clearCart } = useCartStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price + item.addons.reduce((a, b) => a + b.price, 0),
    0
  );

  const handleCheckout = async () => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const order = await orderApi.create(
        {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: 1,
            selectedAddonIds: item.addons.map((a) => a.id),
          })),
        },
        accessToken
      );
      clearCart();
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-12 shadow-soft">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-slate-400"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("empty")}</h2>
          <p className="text-slate-500 mb-8">{t("emptyDesc")}</p>
          <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white transition-all hover:bg-primary-hover shadow-soft hover:shadow-soft-hover">
            {t("browse")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-start shadow-sm">
              <div className="w-full sm:w-32 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-[10px] text-center px-2">{item.title}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{t("baseLicense")}</span>
                    <span className="font-bold text-slate-900">${item.price}</span>
                  </div>
                  {item.addons.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {addon.name}
                      </span>
                      <span className="font-medium text-slate-700">+${addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-soft sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t("summary")}</h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t("subtotal")}</span>
                <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-success">
                <span>{t("discount")}</span>
                <span className="font-medium">-$0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-slate-900 font-bold">{t("total")}</span>
              <span className="text-3xl font-extrabold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            {checkoutError && (
              <p className="text-sm text-red-600 mb-4">{checkoutError}</p>
            )}

            <button
              disabled={checkoutLoading}
              onClick={handleCheckout}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft hover:shadow-soft-hover flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {checkoutLoading ? "Processing..." : t("checkout")} {!checkoutLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
