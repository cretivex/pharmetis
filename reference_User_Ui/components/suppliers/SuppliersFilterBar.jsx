import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { supplierFilters } from '../../data/suppliersCatalog'

export default function SuppliersFilterBar() {
  return (
    <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md ring-1 ring-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-brand sm:hidden">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <span className="text-sm font-bold">Filters</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {supplierFilters.map((label) => (
          <label
            key={label}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand/35 hover:shadow-md"
          >
            <select
              className="max-w-[160px] cursor-pointer appearance-none border-0 bg-transparent pr-1 text-xs font-bold focus:outline-none focus:ring-0"
              defaultValue={label}
              aria-label={label}
            >
              <option>{label}</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand sm:self-center"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Reset Filters
      </button>
    </div>
  )
}
