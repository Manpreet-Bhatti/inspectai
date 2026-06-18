export default function InspectionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-lg bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="h-10 flex-1 rounded-lg bg-muted" />
        <div className="h-10 w-36 rounded-lg bg-muted" />
        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4 px-6 py-4">
              <div className="col-span-2 space-y-1.5">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-4 w-8 rounded bg-muted" />
              <div className="h-4 w-8 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-lg bg-muted" />
              <div className="h-8 w-16 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
