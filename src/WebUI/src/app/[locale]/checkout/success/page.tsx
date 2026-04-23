import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage() {
  const t = await getTranslations("Checkout");

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {t("success")}
        </h1>

        <p className="text-slate-500 mb-10 text-lg">
          {t("successDesc")}
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/profile"
            className="h-14 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft text-lg"
          >
            {t("viewProfile")}
          </Link>
          <Link
            href="/"
            className="h-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-all"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
