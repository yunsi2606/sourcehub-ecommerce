export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="animate-pulse space-y-4 mb-12">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse border border-slate-200 rounded-3xl p-6 bg-white shadow-sm">
            <div className="w-full h-40 bg-slate-200 rounded-2xl mb-6"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6 mb-6"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-full mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
