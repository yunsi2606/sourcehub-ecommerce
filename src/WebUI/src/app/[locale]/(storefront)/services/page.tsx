import { getTranslations } from "next-intl/server";
import { ArrowRight, Code2, Database, Shield, Zap } from "lucide-react";
import { Link } from "@/i18n/routing";

export default async function ServicesPage() {
  const t = await getTranslations("ServicesPage");

  const services = [
    {
      icon: <Code2 className="w-6 h-6 text-indigo-500" />,
      title: t("customDev"),
      desc: t("customDevDesc"),
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      title: t("vpsHosting"),
      desc: t("vpsHostingDesc"),
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      title: t("maintenance"),
      desc: t("maintenanceDesc"),
      color: "bg-amber-50 border-amber-100"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20">

      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">{t("title")}</h1>
        <p className="text-xl text-slate-500 text-balance leading-relaxed">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
        {services.map((service, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-soft transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${service.color}`}>
              {service.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
            <p className="text-slate-500 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-soft">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">{t("contactUs")}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{t("contactDesc")}</p>
          <Link href="/contact" className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white transition-all hover:bg-primary-hover shadow-soft hover:shadow-soft-hover gap-2">
            {t("letTalk")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
