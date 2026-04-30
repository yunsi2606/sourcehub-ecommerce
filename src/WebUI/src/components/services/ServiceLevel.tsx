import { ReactNode } from "react";

interface ServiceLevelProps {
  level: string;
  title: string;
  description: string;
  badgeColor: string;
  children: ReactNode;
}

export function ServiceLevel({ level, title, description, badgeColor, children }: ServiceLevelProps) {
  return (
    <div className="mb-24 last:mb-0">
      <div className="mb-12 text-center md:text-left">
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${badgeColor}`}>
          {level}
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">{title}</h2>
        <p className="text-lg text-slate-500 max-w-2xl">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {children}
      </div>
    </div>
  );
}
