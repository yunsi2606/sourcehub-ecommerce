import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              </div>
              SourceHub
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {t("Footer.description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">{t("Footer.products")}</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/products?category=saas" className="hover:text-primary transition-colors">{t("Footer.saas")}</Link></li>
              <li><Link href="/products?category=templates" className="hover:text-primary transition-colors">{t("Footer.templates")}</Link></li>
              <li><Link href="/products?category=backend" className="hover:text-primary transition-colors">{t("Footer.backend")}</Link></li>
              <li><Link href="/products?category=mobile" className="hover:text-primary transition-colors">{t("Footer.mobile")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">{t("Footer.services")}</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/services#setup" className="hover:text-primary transition-colors">{t("Footer.setup")}</Link></li>
              <li><Link href="/services#customization" className="hover:text-primary transition-colors">{t("Footer.custom")}</Link></li>
              <li><Link href="/services#deployment" className="hover:text-primary transition-colors">{t("Footer.deployment")}</Link></li>
              <li><Link href="/services#vps" className="hover:text-primary transition-colors">{t("Footer.vps")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">{t("Footer.company")}</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("Footer.about")}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t("Footer.blog")}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{t("Footer.terms")}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{t("Footer.privacy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} {t("Footer.rights")}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900 transition-colors">{t("Footer.twitter")}</a>
            <a href="#" className="hover:text-slate-900 transition-colors">{t("Footer.github")}</a>
            <a href="#" className="hover:text-slate-900 transition-colors">{t("Footer.discord")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
