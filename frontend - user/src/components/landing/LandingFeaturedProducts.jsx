import { useNavigate } from 'react-router-dom'
import FilterBar from '../FilterBar'
import MedicinesProductGrid from '../medicines/MedicinesProductGrid'

export default function LandingFeaturedProducts({
  products,
  filters,
  onFilterChange,
  onResetFilters,
  onSendRFQ,
}) {
  const navigate = useNavigate()

  return (
    <section
      id="products"
      className="relative scroll-mt-20 overflow-hidden bg-[#f8fafc] py-8 md:py-10"
    >
      <div className="pattern-dots pattern-grid-fade pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 max-w-xl lg:pt-0.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.6rem] md:text-[1.75rem]">
              Featured Products
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-slate-600 sm:text-[0.9375rem]">
              Browse verified pharmaceutical products from certified global manufacturers
            </p>
          </div>
          <div className="min-w-0 flex-1 lg:max-w-[min(100%,52rem)] lg:flex lg:justify-end">
            <FilterBar
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onResetFilters}
              align="end"
            />
          </div>
        </div>

        <div className="relative mt-5">
          {products.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No products found. Try adjusting your filters.
            </p>
          ) : (
            <MedicinesProductGrid
              products={products}
              onSendRFQ={onSendRFQ}
              onViewDetails={(p) => navigate(`/medicines/${p.slug || p.id}`)}
            />
          )}
        </div>
      </div>
    </section>
  )
}
