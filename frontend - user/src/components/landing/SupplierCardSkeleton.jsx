/** Pulse placeholders matching LandingVerifiedSuppliers card layout (8 on desktop grid). */
export default function SupplierCardSkeleton() {
  return (
    <article
      className="flex flex-col rounded-lg border border-gray-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-gray-900/[0.03]"
      aria-hidden
    >
      <div className="flex gap-2.5">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-slate-200/90" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-[85%] animate-pulse rounded bg-slate-200/90" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-200/70" />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-5 w-7 animate-pulse rounded border border-slate-200/80 bg-slate-100" />
        <div className="h-3 flex-1 animate-pulse rounded bg-slate-200/80" />
      </div>
      <div className="mt-2 flex min-h-[1.5rem] flex-wrap gap-1">
        <div className="h-4 w-14 animate-pulse rounded bg-slate-200/70" />
        <div className="h-4 w-12 animate-pulse rounded bg-slate-200/70" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-2.5 w-full animate-pulse rounded bg-slate-200/60" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-200/60" />
      </div>
      <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-300/80" />
      </div>
    </article>
  )
}
