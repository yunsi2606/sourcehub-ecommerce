import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-slate-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">{t("generalSettings")}</h2>

        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-2xl font-bold border-2 border-white shadow-sm overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
          <div>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              Upload Logo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("siteName")}</label>
            <input
              type="text"
              defaultValue="SourceHub"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("contactEmail")}</label>
            <input
              type="email"
              defaultValue="support@sourcehub.vn"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="h-11 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft">
            {t("saveChanges")}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">{t("security")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("currentPassword")}</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("newPassword")}</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-soft">
            {t("updatePassword")}
          </button>
        </div>
      </div>

    </div>
  );
}
