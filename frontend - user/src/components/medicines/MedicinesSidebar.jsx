import {
  Pill,
  Activity,
  HeartPulse,
  Shield,
  Boxes,
  Globe,
  Factory,
  Package,
  Syringe,
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const categoryIconCycle = [Pill, Activity, HeartPulse, Shield, Boxes]

function pickCategoryIcon(index) {
  return categoryIconCycle[index % categoryIconCycle.length]
}

/** Stacked white card: bold navy title, chevron, divider, rows */
function FilterCard({ title, open, onToggle, children, onClear, showClear }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300/90 bg-white shadow-[0_2px_8px_rgba(5,11,29,0.06),0_4px_14px_-4px_rgba(5,11,29,0.09)] ring-1 ring-slate-900/[0.04]">
      <div className="flex items-stretch gap-1 border-b border-slate-200/90 px-2 sm:px-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5 text-left transition hover:bg-slate-50/80"
        >
          <span className="text-[12px] font-semibold tracking-tight text-[#050b1d]">{title}</span>
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
          )}
        </button>
        {showClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear?.()
            }}
            className="self-center px-0.5 text-[10px] font-semibold text-blue-600 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      {open ? <div className="divide-y divide-slate-100">{children}</div> : null}
    </div>
  )
}

function FilterRow({ icon: Icon, label, selected, onToggle }) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-2 px-2 py-1 transition sm:px-2.5 ${
        selected ? 'bg-sky-50/90' : 'hover:bg-slate-50/80'
      }`}
    >
      <input type="checkbox" checked={selected} onChange={onToggle} className="sr-only" />
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
          selected
            ? 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200/60'
            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/70'
        }`}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span
        className={`min-w-0 flex-1 text-[12px] font-medium leading-snug ${
          selected ? 'text-slate-900' : 'text-slate-800'
        }`}
      >
        {label}
      </span>
      <ChevronRight
        className={`h-3.5 w-3.5 shrink-0 ${selected ? 'text-sky-500' : 'text-sky-300/90'}`}
        aria-hidden
      />
    </label>
  )
}

const CERT_OPTIONS = [
  { value: 'GMP', label: 'GMP / WHO-GMP' },
  { value: 'FDA', label: 'FDA' },
  { value: 'ISO', label: 'ISO' },
]

export default function MedicinesSidebar({
  meta,
  filters,
  toggleFilter,
  expandedSections,
  toggleSection,
  onClearCategories,
  onClearCountries,
  onCategorySlugChange,
  onPriceRangeChange,
  onMinMoqChange,
  onClearCertifications,
  showMobileFilters,
  onCloseMobileFilters,
  dosageLabels,
  availabilityLabels,
}) {
  const categories = meta.categories || []
  const countries = meta.country || []
  const dosageForm = meta.dosageForm || []
  const availability = meta.availability || []
  const therapeuticAreas = meta.therapeuticAreas || []
  const manufacturer = meta.manufacturer || []

  const labelFor = (key, value) => {
    if (key === 'dosageForm') return dosageLabels[value] || value
    if (key === 'availability') return availabilityLabels[value] || value
    return value
  }

  const asideClass = `
    w-full shrink-0 lg:w-[15.5rem] lg:min-h-0
    ${showMobileFilters ? 'fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#f1f4f8] p-3 sm:p-4' : 'hidden'}
    lg:static lg:z-auto lg:block lg:h-auto lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0
  `

  return (
    <aside className={asideClass}>
      {/* Scroll area: mobile = flex fill; desktop = sticky column capped to viewport */}
      <div className="flex min-h-0 flex-1 flex-col lg:sticky lg:top-28 lg:max-h-[min(100dvh-7.25rem,100vh-7.25rem)] lg:min-h-0">
        <div className="mb-2 shrink-0 rounded-xl border border-slate-300/85 bg-white px-3 py-2 shadow-[0_2px_8px_rgba(5,11,29,0.06)] lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-900">Filters</p>
            <button
              type="button"
              onClick={onCloseMobileFilters}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Done
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-0.5 [scrollbar-gutter:stable] touch-pan-y">
          <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:p-3">
            <div className="flex flex-col gap-2 pb-3">
            {categories.length > 0 ? (
              <FilterCard
                title="Category"
                open={expandedSections.categories}
                onToggle={() => toggleSection('categories')}
                showClear={Boolean(filters.categorySlug)}
                onClear={onClearCategories}
              >
                <div className="px-2 py-2 sm:px-2.5">
                  <label className="sr-only" htmlFor="medicines-category-select">
                    Product category
                  </label>
                  <select
                    id="medicines-category-select"
                    value={filters.categorySlug || ''}
                    onChange={(e) => onCategorySlugChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[12px] font-medium text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FilterCard>
            ) : null}

            <FilterCard
              title="Certification"
              open={expandedSections.certification}
              onToggle={() => toggleSection('certification')}
              showClear={filters.certification?.length > 0}
              onClear={onClearCertifications}
            >
              {CERT_OPTIONS.map((opt) => (
                <FilterRow
                  key={opt.value}
                  icon={Shield}
                  label={opt.label}
                  selected={filters.certification?.includes(opt.value)}
                  onToggle={() => toggleFilter('certification', opt.value)}
                />
              ))}
            </FilterCard>

            <FilterCard
              title="Price range"
              open={expandedSections.price}
              onToggle={() => toggleSection('price')}
              showClear={Boolean(filters.minPrice || filters.maxPrice)}
              onClear={() => onPriceRangeChange('', '')}
            >
              <div className="flex flex-col gap-2 px-2 py-2 sm:px-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-slate-600" htmlFor="min-price">
                    Min
                  </label>
                  <input
                    id="min-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => onPriceRangeChange(e.target.value, filters.maxPrice)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[12px] text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-slate-600" htmlFor="max-price">
                    Max
                  </label>
                  <input
                    id="max-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Any"
                    value={filters.maxPrice}
                    onChange={(e) => onPriceRangeChange(filters.minPrice, e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[12px] text-slate-900"
                  />
                </div>
              </div>
            </FilterCard>

            <FilterCard
              title="Minimum order quantity"
              open={expandedSections.moq}
              onToggle={() => toggleSection('moq')}
              showClear={Boolean(filters.minMoq)}
              onClear={() => onMinMoqChange('')}
            >
              <div className="px-2 py-2 sm:px-2.5">
                <label className="sr-only" htmlFor="min-moq">
                  Minimum MOQ (units)
                </label>
                <input
                  id="min-moq"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 500"
                  value={filters.minMoq}
                  onChange={(e) => onMinMoqChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-[12px] text-slate-900"
                />
              </div>
            </FilterCard>

            {countries.length > 0 ? (
              <FilterCard
                title="Country"
                open={expandedSections.country}
                onToggle={() => toggleSection('country')}
                showClear={filters.country.length > 0}
                onClear={onClearCountries}
              >
                {countries.map((c) => (
                  <FilterRow
                    key={c}
                    icon={Globe}
                    label={c}
                    selected={filters.country.includes(c)}
                    onToggle={() => toggleFilter('country', c)}
                  />
                ))}
              </FilterCard>
            ) : null}

            {dosageForm.length > 0 ? (
              <FilterCard
                title="Dosage form"
                open={expandedSections.dosageForm}
                onToggle={() => toggleSection('dosageForm')}
              >
                {dosageForm.map((value, i) => (
                  <FilterRow
                    key={value}
                    icon={i % 2 === 0 ? Syringe : Pill}
                    label={labelFor('dosageForm', value)}
                    selected={filters.dosageForm.includes(value)}
                    onToggle={() => toggleFilter('dosageForm', value)}
                  />
                ))}
              </FilterCard>
            ) : null}

            {availability.length > 0 ? (
              <FilterCard
                title="Availability"
                open={expandedSections.availability}
                onToggle={() => toggleSection('availability')}
              >
                {availability.map((value) => (
                  <FilterRow
                    key={value}
                    icon={Package}
                    label={labelFor('availability', value)}
                    selected={filters.availability.includes(value)}
                    onToggle={() => toggleFilter('availability', value)}
                  />
                ))}
              </FilterCard>
            ) : null}

            {manufacturer.length > 0 ? (
              <FilterCard
                title="Manufacturer"
                open={expandedSections.manufacturer}
                onToggle={() => toggleSection('manufacturer')}
              >
                {manufacturer.map((value) => (
                  <FilterRow
                    key={String(value)}
                    icon={Factory}
                    label={String(value)}
                    selected={filters.manufacturer.includes(value)}
                    onToggle={() => toggleFilter('manufacturer', value)}
                  />
                ))}
              </FilterCard>
            ) : null}

            {therapeuticAreas.length > 0 ? (
              <FilterCard
                title="Therapeutic area"
                open={expandedSections.therapeuticAreas}
                onToggle={() => toggleSection('therapeuticAreas')}
              >
                {therapeuticAreas.map((value, i) => (
                  <FilterRow
                    key={value}
                    icon={i % 2 === 0 ? Heart : Activity}
                    label={value}
                    selected={filters.therapeuticAreas.includes(value)}
                    onToggle={() => toggleFilter('therapeuticAreas', value)}
                  />
                ))}
              </FilterCard>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
