export default function DashboardLoading() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      {/* Title Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-32 animate-pulse"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
