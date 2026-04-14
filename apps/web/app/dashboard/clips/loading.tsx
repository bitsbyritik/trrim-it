import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function ClipsLoading() {
  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-7 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
