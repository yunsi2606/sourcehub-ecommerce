"use client";

import { useTranslations } from "next-intl";
import { Code2, Globe, LayoutDashboard, Cloud, Server, Box, Layers } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceLevel } from "@/components/services/ServiceLevel";
import { useEffect, useState } from "react";
import { productApi } from "@/lib/api/products";
import { ProductSummary } from "@/types/api";

const colors = ["blue", "emerald", "amber", "indigo", "purple", "rose"] as const;
const icons = [Globe, Server, Box, LayoutDashboard, Cloud, Layers, Code2];

export default function ServicesPage() {
  const t = useTranslations("ServicesPage");
  const [services, setServices] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi.getList({ productType: 'StandaloneService', isActive: true })
      .then((res) => {
        setServices(res.items || []);
      })
      .catch((e) => {
        console.error("Failed to fetch services:", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Group by categoryName
  const groupedServices = services.reduce((acc, curr) => {
    const cat = curr.categoryName || "Dịch Vụ Khác";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, ProductSummary[]>);

  const getBadgeColor = (index: number) => {
    const badgeColors = [
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-blue-100 text-blue-700",
      "bg-purple-100 text-purple-700"
    ];
    return badgeColors[index % badgeColors.length];
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
          <Code2 className="w-4 h-4" /> Dịch vụ IT
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight text-balance">
          {t("title") || "Dịch Vụ Lập Trình Chuyên Nghiệp"}
        </h1>
        <p className="text-xl text-slate-500 text-balance leading-relaxed">
          {t("subtitle") || "Đội ngũ chuyên gia của chúng tôi cung cấp giải pháp trọn gói để biến ý tưởng của bạn thành hiện thực."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto mb-20">
        {isLoading ? (
          <div className="text-center text-slate-500 py-12">Đang tải danh sách dịch vụ...</div>
        ) : services.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
            Hiện tại chưa có gói dịch vụ nào được công bố.
          </div>
        ) : (
          Object.entries(groupedServices).map(([categoryName, products], index) => (
            <ServiceLevel 
              key={categoryName}
              level={categoryName} 
              title={`Nhóm: ${categoryName}`} 
              description={`Khám phá các dịch vụ thuộc nhóm ${categoryName}.`}
              badgeColor={getBadgeColor(index)}
            >
              {products.map((product, pIdx) => {
                const IconComponent = icons[pIdx % icons.length];
                const colorTheme = colors[pIdx % colors.length];

                return (
                  <ServiceCard
                    key={product.id}
                    title={product.title}
                    description={product.shortDescription}
                    icon={<IconComponent className="w-6 h-6" />}
                    tags={product.tags}
                    colorTheme={colorTheme}
                    href={`/products/${product.slug}`} // Chuyển đến trang chi tiết sản phẩm để mua
                  />
                );
              })}
            </ServiceLevel>
          ))
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl mt-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">{t("contactUs")}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">{t("contactDesc")}</p>
          <Link href="/contact" className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white transition-all hover:bg-primary-hover shadow-lg hover:shadow-primary/25 gap-2">
            Liên hệ tư vấn Custom
          </Link>
        </div>
      </div>
    </div>
  );
}
