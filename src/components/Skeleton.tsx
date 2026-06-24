"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white border border-border rounded-xl shadow-elevation-1">
      <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4 mt-1" />
        <div className="mt-auto pt-2 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-elevation-1 overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListsPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl border-2 border-dashed border-border" />
      {[1, 2, 3].map((i) => (
        <ListCardSkeleton key={i} />
      ))}
    </div>
  );
}
