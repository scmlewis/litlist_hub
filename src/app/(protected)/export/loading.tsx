export default function ExportLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary rounded-2xl animate-pulse w-12 h-12" />
        <div>
          <div className="h-8 w-36 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted rounded-xl" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
              <div className="h-10 w-24 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
