import { PageHeaderSkeleton, ProfilePageSkeleton } from "@/components/ui/skeletons";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <PageHeaderSkeleton />
      <ProfilePageSkeleton />
    </div>
  );
}
