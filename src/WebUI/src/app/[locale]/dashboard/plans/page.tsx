"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Plus, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { adminPlansApi } from "@/lib/api/plans";
import { Plan } from "@/lib/types/plans";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { Link } from "@/i18n/routing";

export default function AdminPlansPage() {
  const t = useTranslations("Dashboard");
  const accessToken = useAuthStore((s) => s.accessToken);
  const formatPrice = useFormatPrice();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminPlansApi.getAll(accessToken)
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load plans"))
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-slate-500 mt-1">Manage all subscription tiers and pricing</p>
        </div>
        <Link
          href="/dashboard/plans/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 h-24 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <XCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No plans found</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first subscription plan to get started.</p>
          <Link
            href="/dashboard/plans/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative">
              {!plan.isActive && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">
                  Inactive
                </div>
              )}
              <div className="p-6 flex-1">
                <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                  Tier {plan.tier}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="space-y-1 mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-slate-900">{formatPrice(plan.monthlyPrice)}</span>
                    <span className="text-slate-500 font-medium mb-1">/mo</span>
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    or {formatPrice(plan.yearlyPrice)} /year
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-xs font-medium text-slate-400 pl-6">
                      + {plan.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Link
                  href={`/dashboard/plans/${plan.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
