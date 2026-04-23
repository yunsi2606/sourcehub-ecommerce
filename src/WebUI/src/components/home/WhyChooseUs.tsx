import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Why developers choose SourceHub</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We believe in providing clean, scalable, and maintainable code. Our products are built by senior engineers following industry best practices.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1"><ShieldCheck className="w-6 h-6 text-success" /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Production-Ready Code</h4>
                  <p className="text-slate-600">Thoroughly tested, typed, and documented codebases that you can deploy immediately.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1"><Zap className="w-6 h-6 text-yellow-500" /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Modern Tech Stack</h4>
                  <p className="text-slate-600">Built with the latest stable versions of Next.js, React, .NET, and PostgreSQL.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-blue-500" /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Premium Support</h4>
                  <p className="text-slate-600">Direct access to the developers who built the products via our dedicated support portal.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl transform translate-x-4 translate-y-4 -z-10"></div>
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-soft">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <pre className="text-sm font-mono text-slate-700 overflow-x-auto">
                <code>
<span className="text-primary">import</span> {"{ createOrder }"} <span className="text-primary">from</span> <span className="text-emerald-600">'@/lib/api'</span>;{"\n\n"}
<span className="text-slate-400">// Clean, intuitive APIs</span>{"\n"}
<span className="text-primary">const</span> result = <span className="text-primary">await</span> createOrder({"{"}{"\n"}
{"  "}items: [{"{"} productId: <span className="text-emerald-600">'saas-kit'</span>, qty: <span className="text-amber-600">1</span> {"}"}],{"\n"}
{"  "}addons: [<span className="text-emerald-600">'setup-service'</span>]{"\n"}
{"}"});{"\n\n"}
<span className="text-primary">if</span> (result.success) {"{"}{"\n"}
{"  "}console.log(<span className="text-emerald-600">'Ready to launch! 🚀'</span>);{"\n"}
{"}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
