export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-10 text-center animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-48 mx-auto mb-4"></div>
        <div className="h-5 bg-slate-200 rounded w-96 mx-auto"></div>
      </div>

      <div className="space-y-8">
        {/* Section 1 Skeleton */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 animate-pulse">
            <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-6 bg-slate-200 rounded w-48"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div>
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded-xl w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded-xl w-full"></div>
            </div>
          </div>
        </div>

        {/* Section 2 Skeleton */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
