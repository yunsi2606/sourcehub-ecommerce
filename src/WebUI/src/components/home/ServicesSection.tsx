import Link from "next/link";
import { ArrowRight, Code2, Server, Settings } from "lucide-react";

export function ServicesSection() {
  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional IT Services</h2>
          <p className="text-slate-600">Need help bringing your vision to life? Our team of experts is ready to assist with setup, customization, and hosting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-soft-hover transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Installation & Setup</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We'll deploy the source code to your servers, configure the database, and ensure everything runs perfectly.
            </p>
            <Link href="/services#setup" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-soft-hover transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">Popular</div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Custom Development</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Need extra features? We can modify our existing products or build entirely new modules tailored to your needs.
            </p>
            <Link href="/services#customization" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100 hover:shadow-soft-hover transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Managed Hosting</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              High-performance VPS hosting optimized for our products. Includes daily backups, SSL, and monitoring.
            </p>
            <Link href="/services#hosting" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
