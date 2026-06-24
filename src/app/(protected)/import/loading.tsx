export default function ImportLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary rounded-2xl animate-pulse w-12 h-12" />
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-8 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-4 w-64 bg-muted rounded mb-6" />
        <div className="space-y-4">
          <div className="h-12 w-full bg-muted rounded-xl" />
          <div className="h-12 w-full bg-muted rounded-xl" />
          <div className="h-12 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
