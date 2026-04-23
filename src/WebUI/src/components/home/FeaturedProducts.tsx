import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";

export function FeaturedProducts() {
  const products = [
    {
      title: "Full-Stack SaaS Boilerplate",
      slug: "saas-starterkit",
      description: "Everything you need to launch your SaaS. Authentication, payments, dashboard, and clean architecture included.",
      price: 149,
      imageGradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
      tags: ["Next.js", "Supabase"],
      version: "v2.0"
    },
    {
      title: "Clean Architecture E-Commerce API",
      slug: "ecommerce-api",
      description: "Robust backend solution featuring CQRS, JWT Auth, Stripe integration, and comprehensive unit tests.",
      price: 199,
      salePrice: 99,
      imageGradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      tags: [".NET 8", "PostgreSQL"]
    },
    {
      title: "Premium Dashboard Template",
      slug: "admin-ui",
      description: "50+ pre-built components, 10+ page layouts, dark mode support, and fully responsive design.",
      price: 49,
      imageGradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
      tags: ["React", "Tailwind"]
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => <ProductCard key={i} {...p} />)}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors gap-1">
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
