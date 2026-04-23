import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { productApi, categoryApi, tagApi } from "@/lib/api";
import { ProductCard } from "@/components/shared/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

// For Next.js 15+, searchParams is a Promise. We need to await it.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("Products");
  const params = await searchParams;

  const currentCategory = typeof params.category === 'string' ? params.category : undefined;
  const currentTag = typeof params.tag === 'string' ? params.tag : undefined;
  const currentSearch = typeof params.search === 'string' ? params.search : undefined;

  let products: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    const [productsRes, categoriesRes, tagsRes] = await Promise.all([
      productApi.getList({
        categorySlug: currentCategory,
        tagSlug: currentTag,
        searchTerm: currentSearch
      }),
      categoryApi.getAll(),
      tagApi.getAll()
    ]);
    products = productsRes.items || [];
    categories = categoriesRes || [];
    tags = tagsRes || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  const hasFilters = currentCategory || currentTag || currentSearch;

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="sticky top-24 space-y-8">

          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                defaultValue={currentSearch}
                placeholder={t("searchPlaceholder")}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> {t("filters")}
                </h3>
                <Link href="/products" className="text-xs text-primary hover:underline">
                  {t("clearFilters")}
                </Link>
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">{t("categories")}</h3>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/products?category=${c.slug}${currentTag ? `&tag=${currentTag}` : ''}`}
                      className={`text-sm flex items-center justify-between transition-colors ${currentCategory === c.slug ? 'text-primary font-medium' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">{t("tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tg) => (
                  <Link
                    key={tg.slug}
                    href={`/products?tag=${tg.slug}${currentCategory ? `&category=${currentCategory}` : ''}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${currentTag === tg.slug ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'}`}
                  >
                    {tg.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("title")}</h1>
          <p className="text-slate-600">{t("subtitle")}</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                title={p.title}
                slug={p.slug}
                description={p.shortDescription}
                price={p.price}
                salePrice={p.salePrice}
                thumbnailUrl={p.thumbnailUrl}
                tags={p.tags || []}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500">{t("noResults")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
