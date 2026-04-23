import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { productApi } from "@/lib/api";
import { ChevronRight, FileCode2, ShieldCheck, ShoppingCart, Zap } from "lucide-react";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("ProductDetail");

  let product: any = null;

  try {
    product = await productApi.getBySlug(slug);
  } catch (error) {
    console.error("Failed to fetch product detail:", error);
  }

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/products?category=${product.categoryName}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-12">

          {/* Main Thumbnail */}
          <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-sm">
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-3xl px-8 text-center">{product.title}</span>
              </div>
            )}
          </div>

          {/* Tech Stack Tags */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{t("techStack")}</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
            {product.techStack && (
              <p className="mt-4 text-sm text-slate-600">{product.techStack}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("description")}</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing Card */}
        <div className="relative">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-8 shadow-soft">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{product.title}</h1>
            <p className="text-sm text-slate-500 mb-6">{product.shortDescription}</p>

            <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-slate-100">
              {product.salePrice ? (
                <>
                  <span className="text-4xl font-extrabold text-slate-900">${product.salePrice}</span>
                  <span className="text-lg text-slate-400 line-through">${product.price}</span>
                </>
              ) : (
                <span className="text-4xl font-extrabold text-slate-900">${product.price}</span>
              )}
              <span className="text-sm text-slate-500 ml-1">/ one-time</span>
            </div>

            <div className="space-y-4 mb-8">
              <button className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-soft hover:shadow-soft-hover flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> {t("buyNow")}
              </button>
            </div>

            {/* Included Features */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">{t("includes")}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <FileCode2 className="w-5 h-5 text-success shrink-0" />
                  <span>{t("sourceCode")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                  <span>{t("commercialLicense")}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <Zap className="w-5 h-5 text-success shrink-0" />
                  <span>{t("lifetimeUpdates")}</span>
                </li>
              </ul>
            </div>

            {/* Addons */}
            {product.addons && product.addons.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">{t("addons")}</h4>
                <div className="space-y-3">
                  {product.addons.map((addon: any) => (
                    <label key={addon.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{addon.name}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">+${addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
