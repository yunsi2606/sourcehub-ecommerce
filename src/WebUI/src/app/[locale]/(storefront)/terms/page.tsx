import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Terms");

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{t("title")}</h1>
        <p className="text-slate-500">{t("subtitle")}</p>
      </div>

      <div className="prose prose-slate prose-lg max-w-none text-slate-600">
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("license")}</h2>
          <p>{t("licenseDesc")}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("refund")}</h2>
          <p>{t("refundDesc")}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("support")}</h2>
          <p>{t("supportDesc")}</p>
        </section>
      </div>
    </div>
  );
}
