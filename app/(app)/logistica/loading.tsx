import { MetricCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-4 lgx:p-6 space-y-6">
      <div className="grid grid-cols-2 lgx:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid lgx:grid-cols-2 gap-4">
        <ChartSkeleton className="h-72" />
        <ChartSkeleton className="h-72" />
      </div>
    </div>
  );
}
