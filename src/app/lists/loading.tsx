import { ListsPageSkeleton } from "@/components/Skeleton";

export default function ListsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl animate-pulse w-12 h-12" />
          <div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-28 bg-muted rounded-xl animate-pulse" />
      </div>
      <ListsPageSkeleton />
    </div>
  );
}
