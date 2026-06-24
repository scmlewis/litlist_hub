import { SearchResultsSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary rounded-2xl animate-pulse w-12 h-12" />
        <div>
          <div className="h-8 w-40 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 bg-muted rounded-xl animate-pulse" />
          <div className="h-12 w-28 bg-primary rounded-xl animate-pulse" />
        </div>

        <div className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl animate-pulse">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded-full" />
          <div className="h-8 w-20 bg-muted rounded-full" />
        </div>

        <SearchResultsSkeleton />
      </div>
    </div>
  );
}
