export default function BuyerTableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <div className="h-8 w-full rounded bg-slate-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded bg-slate-50" />
      ))}
    </div>
  )
}
