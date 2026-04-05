/** Placeholder grid for medicines catalog loading state. */
export default function MedicineCardSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm"
          aria-hidden
        >
          <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-slate-200/90" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-[85%] animate-pulse rounded bg-slate-200/80" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/60" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-200/80" />
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-300/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
