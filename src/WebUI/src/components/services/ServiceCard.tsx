import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  tags?: string[];
  colorTheme: "blue" | "emerald" | "amber" | "indigo" | "purple" | "rose";
  href: string;
}

const colorMaps = {
  blue: "bg-blue-50 border-blue-100 text-blue-600",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
  amber: "bg-amber-50 border-amber-100 text-amber-600",
  indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
  purple: "bg-purple-50 border-purple-100 text-purple-600",
  rose: "bg-rose-50 border-rose-100 text-rose-600",
};

export function ServiceCard({ title, description, icon, tags, colorTheme, href }: ServiceCardProps) {
  const iconThemeClass = colorMaps[colorTheme];

  return (
    <div className="relative group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${iconThemeClass}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-500 leading-relaxed mb-6 flex-grow">{description}</p>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link href={href} className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-primary transition-colors mt-auto w-fit">
        Đăng ký dịch vụ <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
