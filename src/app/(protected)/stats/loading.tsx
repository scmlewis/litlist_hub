export default function StatsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-16 w-16 mx-auto bg-muted rounded-2xl animate-pulse mb-4" />
        <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-36 mx-auto bg-muted rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-lg mb-3" />
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-xl" />
                <div>
                  <div className="h-7 w-12 bg-muted rounded mb-1" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
          <div className="h-5 w-40 bg-muted rounded mb-6" />
          <div className="flex items-end justify-between gap-2 h-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-muted rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
                <div className="h-3 w-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
