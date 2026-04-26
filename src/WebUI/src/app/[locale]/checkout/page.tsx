"use client";

import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { orderApi } from "@/lib/api";
import { paymentsApi } from "@/lib/api/orders";
import { useFormatPrice } from "@/hooks/useFormatPrice";

type CheckoutStep = "review" | "redirecting";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { accessToken, user } = useAuthStore();
  const formatPrice = useFormatPrice();

  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items, router]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price + item.addons.reduce((a, b) => a + b.price, 0),
    0
  );

  const handlePayWithStripe = async () => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    setError(null);
    setStep("redirecting");

    try {
      // 1. Create the order (Pending status)
      const order = await orderApi.create(
        {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: 1,
            selectedAddonIds: item.addons.map((a) => a.id),
          })),
          notes: notes.trim() || undefined,
        },
        accessToken
      );

      // 2. Initiate Stripe Checkout session
      const { redirectUrl } = await paymentsApi.initiateStripe(order.id, accessToken);

      // 3. Clear cart then redirect to Stripe
      clearCart();
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
      setStep("review");
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/cart"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thanh toán đơn hàng</h1>
          <p className="text-slate-500 text-sm">Xem lại đơn hàng và thanh toán qua Stripe</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm text-slate-500 font-medium">Giỏ hàng</span>
        </div>
        <div className="h-px flex-1 bg-slate-200 max-w-[48px]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            2
          </div>
          <span className="text-sm text-slate-900 font-bold">Xác nhận</span>
        </div>
        <div className="h-px flex-1 bg-slate-200 max-w-[48px]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
            3
          </div>
          <span className="text-sm text-slate-400 font-medium">Thanh toán</span>
        </div>
        <div className="h-px flex-1 bg-slate-200 max-w-[48px]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
            4
          </div>
          <span className="text-sm text-slate-400 font-medium">Hoàn tất</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Review */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Người mua</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Sản phẩm ({items.length})
            </h2>
            <div className="space-y-4 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 pt-4 first:pt-0">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                    {item.addons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-xs text-slate-500">
                            <span>+ {addon.name}</span>
                            <span>{formatPrice(addon.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-bold text-slate-900 text-sm">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Ghi chú <span className="text-slate-400 font-normal normal-case">(tùy chọn)</span>
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={step === "redirecting"}
              placeholder="Yêu cầu đặc biệt, ghi chú cho đội ngũ hỗ trợ..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Right: Summary + Pay */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft sticky top-24 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Tóm tắt đơn hàng</h3>

            {/* Line items */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              {items.map((item) => {
                const lineTotal = item.price + item.addons.reduce((a, b) => a + b.price, 0);
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[140px]">{item.title}</span>
                    <span className="font-medium text-slate-900 ml-2 shrink-0">{formatPrice(lineTotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 pb-4 border-b border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá</span>
                <span className="font-medium">-{formatPrice(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-900">Tổng cộng</span>
              <span className="text-2xl font-extrabold text-slate-900">{formatPrice(subtotal)}</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayWithStripe}
              disabled={step === "redirecting"}
              className="w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white shadow-soft disabled:opacity-70"
            >
              {step === "redirecting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang chuyển hướng...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Thanh toán qua Stripe
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3 h-3" />
              <span>Thanh toán bảo mật qua Stripe SSL</span>
            </div>

            {/* Future gateways placeholder */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-2">Sắp ra mắt</p>
              <div className="flex gap-2 justify-center opacity-40 grayscale">
                <span className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">VNPay</span>
                <span className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">MoMo</span>
                <span className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">Banking</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Bằng cách thanh toán, bạn đồng ý với{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Điều khoản sử dụng
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
