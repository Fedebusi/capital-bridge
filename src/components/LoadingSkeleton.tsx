export function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 rounded mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-7 w-24 bg-slate-200 rounded mt-3" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-slate-50 px-5 py-3">
          <div className="h-3 w-full bg-slate-100 rounded" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="px-5 py-4 border-t border-slate-100 flex gap-4">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-50 rounded" />
            <div className="h-4 w-16 bg-slate-50 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
