import { ListsPageSkeleton } from "@/components/Skeleton";

export default function ListsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl animate-pulse w-12 h-12" />
          </div>
          <div>
            <div className="h-8 w-32 bg-stone-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-stone-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-28 bg-stone-700 rounded-xl animate-pulse" />
      </div>
      <ListsPageSkeleton />
    </div>
  );
}
