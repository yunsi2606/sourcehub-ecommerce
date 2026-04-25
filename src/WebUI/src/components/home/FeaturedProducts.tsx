"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { productApi } from "@/lib/api/products";
import { useEffect, useState } from "react";
import { ProductSummary } from "@/types/api";

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi.getList({ isFeatured: true, pageSize: 3 })
      .then((res) => {
        setProducts(res.items || []);
      })
      .catch((err) => {
        console.error("Failed to fetch featured products:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Dữ liệu mock (fallback) trong trường hợp API chưa chạy hoặc trả về rỗng
  const displayProducts = products.length > 0 ? products : [
    {
      id: "mock-1",
      title: "Full-Stack SaaS Boilerplate",
      slug: "saas-starterkit",
      shortDescription: "Everything you need to launch your SaaS. Authentication, payments, dashboard, and clean architecture included.",
      price: 149,
      salePrice: null,
      thumbnailUrl: null,
      tags: ["Next.js", "Supabase"],
      imageGradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
      version: "v2.0"
    },
    {
      id: "mock-2",
      title: "Clean Architecture E-Commerce API",
      slug: "ecommerce-api",
      shortDescription: "Robust backend solution featuring CQRS, JWT Auth, Stripe integration, and comprehensive unit tests.",
      price: 199,
      salePrice: 99,
      thumbnailUrl: null,
      tags: [".NET 8", "PostgreSQL"],
      imageGradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      id: "mock-3",
      title: "Premium Dashboard Template",
      slug: "admin-ui",
      shortDescription: "50+ pre-built components, 10+ page layouts, dark mode support, and fully responsive design.",
      price: 49,
      salePrice: null,
      thumbnailUrl: null,
      tags: ["React", "Tailwind"],
      imageGradient: "bg-gradient-to-br from-emerald-400 to-teal-500"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Products</h2>
            <p className="text-slate-600">Top-rated source code and starter kits.</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50">
             {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-[420px] rounded-2xl bg-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((p, i) => (
              <ProductCard 
                key={p.id || i}
                title={p.title}
                slug={p.slug}
                description={p.shortDescription}
                price={p.price}
                salePrice={p.salePrice}
                thumbnailUrl={p.thumbnailUrl}
                tags={p.tags || []}
                imageGradient={(p as any).imageGradient}
                version={(p as any).version}
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors gap-1">
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
