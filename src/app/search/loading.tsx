import { SearchResultsSkeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-40" />
          <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl animate-pulse w-12 h-12" />
        </div>
        <div>
          <div className="h-8 w-40 bg-stone-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-stone-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 bg-stone-700 rounded-2xl animate-pulse" />
          <div className="h-12 w-28 bg-stone-700 rounded-2xl animate-pulse" />
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-700/30 rounded-2xl animate-pulse">
          <div className="h-5 w-16 bg-stone-700 rounded" />
          <div className="h-8 w-24 bg-stone-700 rounded-xl" />
          <div className="h-8 w-20 bg-stone-700 rounded-xl" />
        </div>

        <SearchResultsSkeleton />
      </div>
    </div>
  );
}
