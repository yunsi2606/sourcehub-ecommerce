"use client";

import { useEffect, useState } from "react";
import { UserPlan } from "@/lib/types/plans";
import { plansApi } from "@/lib/api/plans";
import { toast } from "sonner";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";

export default function BillingSettings() {
  const t = useTranslations("Billing");
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const fetchMyPlan = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await plansApi.getMyCurrentPlan(accessToken);
        const data = (res as any).data || res;
        setCurrentPlan(data);
      } catch (error) {
        console.error("Failed to fetch current plan", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPlan();
  }, [accessToken]);

  const handleManageBilling = async () => {
    if (!accessToken) return;
    
    try {
      setIsRedirecting(true);
      const res = await plansApi.getBillingPortal(accessToken);
      const data = (res as any).data || res;
      
      if (data?.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        toast.error("Billing portal is not available");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not open billing portal");
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const hasPlan = currentPlan && currentPlan.tier > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          {t("title")}
        </h2>
        {hasPlan && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            currentPlan.status === 'Active' 
              ? 'bg-success/10 text-success' 
              : 'bg-warning/10 text-warning'
          }`}>
            {currentPlan.status || 'Active'}
          </span>
        )}
      </div>
      
      {hasPlan ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="text-sm text-slate-500 mb-1">{t("currentPlan")}</div>
              <div className="text-xl font-bold text-slate-900">{currentPlan.planName}</div>
              <div className="text-sm text-slate-600 mt-2">
                {t("billed")} {currentPlan.billingCycle}
                {currentPlan.currentPeriodEnd && (
                  <> • {t("renewsOn")} {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()}</>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleManageBilling}
              disabled={isRedirecting}
              className="h-11 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isRedirecting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("manageBilling")}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t("noPlan")}</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {t("noPlanDesc")}
          </p>
          <Link 
            href="/pricing"
            className="inline-flex h-11 px-6 items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft"
          >
            {t("viewPlans")}
          </Link>
        </div>
      )}
    </div>
  );
}
