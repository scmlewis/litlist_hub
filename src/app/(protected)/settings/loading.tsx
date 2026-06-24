export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary rounded-2xl animate-pulse w-12 h-12" />
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
          <div className="h-5 w-24 bg-muted rounded mb-4" />
          <div className="space-y-4">
            <div className="h-12 w-full bg-muted rounded-xl" />
            <div className="h-12 w-full bg-muted rounded-xl" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-elevation-1 p-6 animate-pulse">
          <div className="h-5 w-32 bg-muted rounded mb-4" />
          <div className="h-12 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
