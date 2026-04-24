import { Skeleton } from "@/components/ui/skeletons";

// Generic skeleton — just a neutral shimmer bar while the route segment loads.
// Each page handles its own Suspense fallback with domain-specific skeletons.
export default function StorefrontLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-9 w-48 mb-3" />
      <Skeleton className="h-5 w-72 mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
