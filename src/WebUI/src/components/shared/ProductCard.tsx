"use client";

import Link from "next/link";
import { useFormatPrice } from "@/hooks/useFormatPrice";

interface ProductCardProps {
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  imageGradient?: string;
  thumbnailUrl?: string | null;
  tags: string[];
  version?: string;
}

export function ProductCard({
  title,
  slug,
  description,
  price,
  salePrice,
  imageGradient = "bg-gradient-to-br from-slate-200 to-slate-300",
  thumbnailUrl,
  tags,
  version
}: ProductCardProps) {
  const formatPrice = useFormatPrice();

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:shadow-soft-hover flex flex-col h-full">
      <div className="aspect-[16/9] w-full rounded-xl bg-slate-100 mb-6 overflow-hidden relative border border-slate-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <>
            <div className={`absolute inset-0 opacity-90 ${imageGradient}`}></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl text-center px-4">{title}</div>
          </>
        )}
        {version && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-900">
            {version}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, i) => (
            <span key={i} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${i === 0 ? 'text-primary bg-primary/10' : 'text-slate-600 bg-slate-100'}`}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
          <Link href={`/products/${slug}`}>{title}</Link>
        </h3>
        <p className="text-sm text-slate-500 mb-6 flex-1">
          {description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1">
            {salePrice ? (
              <>
                <span className="text-slate-400 line-through text-sm mr-1">{formatPrice(price)}</span>
                <span className="text-xl font-bold text-success">{formatPrice(salePrice)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-slate-900">{formatPrice(price)}</span>
            )}
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary-hover">View Details</button>
        </div>
      </div>
    </div>
  );
}
