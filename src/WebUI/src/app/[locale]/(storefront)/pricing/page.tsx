import { getTranslations } from "next-intl/server";
import PricingPlans from "@/components/pricing/PricingPlans";

export default async function PricingPage() {
  const t = await getTranslations("Pricing");

  const translations = {
    title: t("title"),
    subtitle: t("subtitle"),
    monthly: t("monthly"),
    yearly: t("yearly"),
    mostPopular: t("mostPopular"),
    getStarted: t("getStarted"),
    contactSales: t("contactSales"),
    freeUpdates: t("freeUpdates", { default: "Free Updates" }),
    support: t("support", { default: "Priority Support" }),
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{translations.title}</h1>
        <p className="text-xl text-slate-500">{translations.subtitle}</p>
      </div>
      
      <PricingPlans translations={translations} />
    </div>
  );
}
