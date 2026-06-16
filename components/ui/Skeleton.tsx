import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        "animate-pulse rounded-r1 bg-gradient-to-r from-bone via-cream to-bone bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-paper rounded-r2 shadow-sh-1 border border-line p-4 flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={twMerge("bg-paper rounded-r2 shadow-sh-1 border border-line p-4", className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
