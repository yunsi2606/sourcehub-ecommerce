import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t("title")}</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

      <div className="space-y-20">
        <section className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("mission")}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{t("missionDesc")}</p>
          </div>
          <div className="flex-1 w-full aspect-video bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <span className="text-4xl">🚀</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">{t("team")}</h2>
          <p className="text-lg text-slate-600 leading-relaxed text-center max-w-2xl mx-auto mb-12">{t("teamDesc")}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 rounded-full bg-slate-200 mx-auto mb-4 border-4 border-white shadow-soft"></div>
                <h3 className="text-lg font-bold text-slate-900">Member {i}</h3>
                <p className="text-sm text-slate-500">Engineer</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
