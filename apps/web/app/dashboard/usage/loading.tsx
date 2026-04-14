import { Skeleton, SkeletonChart } from "@/components/ui/Skeleton";

export default function UsageLoading() {
  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <SkeletonChart />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
