export default function GoalsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-16 w-16 mx-auto bg-stone-700 rounded-2xl animate-pulse mb-4" />
        <div className="h-8 w-40 mx-auto bg-stone-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 mx-auto bg-stone-700 rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-9 w-9 bg-stone-700 rounded-xl animate-pulse" />
        <div className="h-8 w-24 bg-stone-700 rounded animate-pulse" />
        <div className="h-9 w-9 bg-stone-700 rounded-xl animate-pulse" />
      </div>

      <div className="glass-card rounded-2xl p-8 animate-pulse">
        <div className="h-48 w-48 mx-auto bg-stone-700 rounded-full mb-6" />
        <div className="h-6 w-48 mx-auto bg-stone-700 rounded mb-2" />
        <div className="h-4 w-32 mx-auto bg-stone-700 rounded" />
      </div>
    </div>
  );
}
