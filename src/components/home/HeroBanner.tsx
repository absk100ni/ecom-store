import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Search, ShieldCheck } from 'lucide-react';
import * as api from '../../services/api';

export default function HeroBanner() {
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    api.getCategoryTree()
      .then((response) => {
        const roots = (response.data.categories || []).filter((category: any) => category.level === 0);
        setDepartments(roots.slice(0, 3));
      })
      .catch(() => setDepartments([]));
  }, []);
  return (
    <section className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="market-grid">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.18em] mb-5">
                <span className="w-7 h-px bg-amber-400" /> Hardware and electronics marketplace
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.04em] max-w-3xl">
                Parts and equipment for the work that matters.
              </h1>
              <p className="mt-5 text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Browse electrical supplies, electronic components, lighting and practical hardware with clear pricing, stock and delivery information.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/products" className="btn-primary inline-flex items-center justify-center gap-2">
                  Browse catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/track" className="btn-secondary-dark inline-flex items-center justify-center gap-2">
                  Track an order
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2"><Search className="w-4 h-4 text-amber-400" /> Search by product or component</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Gateway-protected payments</span>
              </div>
            </div>

            {departments.length > 0 && (
              <div className="hidden lg:block">
                <div className="border border-slate-700 bg-slate-900/80 p-2 shadow-2xl">
                  <div className="border border-slate-700 bg-slate-950 px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Catalog departments</p>
                  </div>
                  {departments.map((department, index) => (
                    <Link
                      key={department.slug || department.id}
                      to={`/products?category=${encodeURIComponent(department.slug || department.name)}`}
                      className="group flex items-center gap-4 border-x border-b border-slate-700 px-5 py-5 hover:bg-slate-800 transition-colors"
                    >
                      <span className="w-10 h-10 border border-slate-600 bg-slate-900 flex items-center justify-center text-amber-400 group-hover:border-amber-400">
                        <Boxes className="w-5 h-5" />
                      </span>
                      <span className="font-semibold flex-1">{department.name}</span>
                      <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
