import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'moq-asc', label: 'MOQ: Low to High' },
  { value: 'rating-desc', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
]

export default function MedicinesListingToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  activeFiltersCount,
}) {
  return (
    <div className="sticky top-14 z-30 border-b border-gray-200/90 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, APIs, manufacturers…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-600" aria-hidden />
              Filters
              {activeFiltersCount > 0 ? (
                <span className="rounded-full bg-brand px-1.5 py-0.5 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              ) : null}
            </button>

            <div className="relative min-w-[10rem] flex-1 sm:flex-initial sm:min-w-[12.5rem]">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            </div>

            <div
              className="ml-auto inline-flex rounded-xl border border-gray-200 bg-gray-50/80 p-1 shadow-inner"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                onClick={() => onViewChange('grid')}
                className={`rounded-lg p-2 transition ${
                  view === 'grid'
                    ? 'bg-white text-brand shadow-sm ring-1 ring-gray-200/80'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                }`}
                aria-pressed={view === 'grid'}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`rounded-lg p-2 transition ${
                  view === 'list'
                    ? 'bg-white text-brand shadow-sm ring-1 ring-gray-200/80'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                }`}
                aria-pressed={view === 'list'}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
