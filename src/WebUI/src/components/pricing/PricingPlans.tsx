"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Plan } from "@/lib/types/plans";
import { plansApi } from "@/lib/api/plans";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useFormatPrice } from "@/hooks/useFormatPrice";

interface PricingPlansProps {
  translations: {
    title: string;
    subtitle: string;
    monthly: string;
    yearly: string;
    mostPopular: string;
    getStarted: string;
    contactSales: string;
    freeUpdates: string;
    support: string;
  };
}

export default function PricingPlans({ translations: t }: PricingPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user;
  const formatPrice = useFormatPrice();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansApi.getActivePlans();
        const data = Array.isArray(res) ? res : ((res as any).data || []);
        
        const sorted = [...data].sort((a, b) => a.tier - b.tier);
        setPlans(sorted);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast.error("Could not load pricing plans");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async (plan: Plan) => {
    if (plan.tier === 3 && plan.monthlyPrice === 0) {
      window.location.href = "mailto:sales@source-ecommerce.com";
      return;
    }

    if (!isAuthenticated || !accessToken) {
      toast.error("Please login to subscribe to a plan");
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const res = await plansApi.createCheckout({
        planId: plan.id,
        billingCycle: isYearly ? "yearly" : "monthly"
      }, accessToken);
      
      const data = res as any;
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Could not initiate checkout session");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during checkout");
    } finally {
      setLoadingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 flex items-center justify-center gap-4">
        <span className={`text-sm font-bold ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>{t.monthly}</span>
        <button 
          onClick={() => setIsYearly(!isYearly)}
          className="w-14 h-8 rounded-full bg-primary/20 p-1 cursor-pointer transition-colors flex items-center"
        >
          <div className={`w-6 h-6 rounded-full bg-primary transform transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
        <span className={`text-sm font-bold ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>{t.yearly}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
        {plans.map((plan) => {
          const isPopular = plan.tier === 2;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          
          return (
            <div 
              key={plan.id}
              className={`border rounded-3xl p-8 transition-all duration-300 ${
                isPopular 
                  ? 'bg-slate-900 border-slate-800 shadow-soft relative transform md:-translate-y-4 hover:-translate-y-6' 
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {t.mostPopular}
                </div>
              )}
              
              <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 h-10 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              
              <div className="mb-8">
                <span className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                  {formatPrice(price)}
                </span>
                <span className={isPopular ? 'text-slate-400' : 'text-slate-500'}>
                  /{isYearly ? 'yr' : 'mo'}
                </span>
              </div>
              
              <button 
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlanId === plan.id}
                className={`w-full h-12 rounded-xl font-bold transition-colors mb-8 flex items-center justify-center gap-2 ${
                  isPopular 
                    ? 'bg-primary hover:bg-primary-hover text-white shadow-soft' 
                    : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                {loadingPlanId === plan.id && <Loader2 className="w-5 h-5 animate-spin" />}
                {plan.tier === 3 ? t.contactSales : t.getStarted}
              </button>
              
              <ul className="space-y-4">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-3 text-sm ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Check className={`w-5 h-5 flex-shrink-0 ${isPopular ? 'text-primary' : 'text-success'}`} /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
