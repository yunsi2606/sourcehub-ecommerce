import { PageHeaderSkeleton, PageWithSidebarSkeleton } from "@/components/ui/skeletons";

export default function StorefrontLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeaderSkeleton />
      <PageWithSidebarSkeleton />
    </div>
  );
}
