// Reusable Skeleton Components
// Import what you need and compose them in loading.tsx or Suspense fallbacks

// Primitive

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

// Cards

/** Single card skeleton matching ProductCard / service card proportions */
export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse">
      <Skeleton className="w-full h-40 rounded-2xl mb-4" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

/** Responsive grid of CardSkeletons */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Sidebar

/** Sidebar filter skeleton (search box + category list + tags) */
export function SidebarSkeleton() {
  return (
    <aside className="w-full lg:w-64 shrink-0 animate-pulse">
      <Skeleton className="h-10 w-full rounded-lg mb-6" />
      <Skeleton className="h-4 w-24 mb-3" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full mb-2" />
      ))}
      <Skeleton className="h-4 w-24 mb-3 mt-6" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
    </aside>
  );
}

// Page layout helpers

/** Full storefront page: sidebar + grid */
export function PageWithSidebarSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <SidebarSkeleton />
      <main className="flex-1">
        <CardGridSkeleton count={count} />
      </main>
    </div>
  );
}

/** Page header (title + subtitle) */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <Skeleton className="h-9 w-48 mb-3" />
      <Skeleton className="h-5 w-72" />
    </div>
  );
}

// Dashboard

/** Table row skeleton (for dashboard list pages) */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** Table card wrapper with multiple rows */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

/** Dashboard stats cards (3-up) */
export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
          <Skeleton className="w-10 h-10 rounded-lg mb-4" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Full dashboard overview skeleton */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      <StatCardsSkeleton />
      <TableSkeleton rows={4} />
    </div>
  );
}

// Profile

/** Profile form section skeleton */
export function ProfileSectionSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Full profile page skeleton */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <ProfileSectionSkeleton />
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-pulse">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
