import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      
      <div className="container relative mx-auto px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          {t("badge")}
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6 text-balance">
          {t("headlinePrefix")} <br className="hidden sm:block" />
          <span className="text-primary">{t("headlineHighlight")}</span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 text-balance leading-relaxed">
          {t("subheadline")}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/products" className="flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:-translate-y-0.5 shadow-soft hover:shadow-soft-hover gap-2">
            {t("browseProducts")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/services" className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50 hover:-translate-y-0.5 shadow-sm">
            {t("viewServices")}
          </Link>
        </div>
      </div>
    </section>
  );
}
