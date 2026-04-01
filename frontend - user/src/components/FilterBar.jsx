import { useEffect, useState } from 'react'
import { X, Globe, ShieldCheck, Pill, Package, CheckCircle2, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react'
import FilterSelect from './ui/FilterSelect'

const MOBILE_IDS = ['fp-filter-country', 'fp-filter-cert', 'fp-filter-dosage', 'fp-filter-moq', 'fp-filter-avail']

function FilterBar({ filters, onFilterChange, onReset, align = 'end' }) {
  const [draft, setDraft] = useState(filters)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setDraft(filters)
  }, [filters])

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== 'All' && value !== ''
  ).length

  const countryMap = {
    All: 'All Countries',
    IN: 'India',
    US: 'United States',
    DE: 'Germany',
    GB: 'United Kingdom',
    CN: 'China',
  }

  const certificationMap = {
    All: 'All Certifications',
    'WHO-GMP': 'WHO-GMP',
    FDA: 'FDA',
    ISO: 'ISO 9001',
    GMP: 'GMP',
  }

  const dosageFormMap = {
    All: 'All Dosage Forms',
    Tablet: 'Tablet',
    Capsule: 'Capsule',
    Injection: 'Injection',
    Syrup: 'Syrup',
    API: 'API',
  }

  const moqMap = {
    All: 'All MOQ',
    '0-1000': '0 - 1,000 units',
    '1000-10000': '1,000 - 10,000 units',
    '10000+': '10,000+ units',
  }

  const availabilityMap = {
    All: 'All Availability',
    'In Stock': 'In Stock',
    'Made to Order': 'Made to Order',
  }

  const handleDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    const keys = ['country', 'certification', 'dosageForm', 'moq', 'availability']
    keys.forEach((key) => {
      if (draft[key] !== filters[key]) {
        onFilterChange(key, draft[key])
      }
    })
  }

  const handleApplyAndClose = () => {
    handleApply()
    setSheetOpen(false)
  }

  const handleRemoveFilter = (filterKey) => {
    onFilterChange(filterKey, 'All')
  }

  const getActiveFilterChips = () => {
    const chips = []
    if (filters.country !== 'All') {
      chips.push({ key: 'country', label: countryMap[filters.country], value: filters.country })
    }
    if (filters.certification !== 'All') {
      chips.push({
        key: 'certification',
        label: certificationMap[filters.certification],
        value: filters.certification,
      })
    }
    if (filters.dosageForm !== 'All') {
      chips.push({ key: 'dosageForm', label: dosageFormMap[filters.dosageForm], value: filters.dosageForm })
    }
    if (filters.moq !== 'All') {
      chips.push({ key: 'moq', label: moqMap[filters.moq], value: filters.moq })
    }
    if (filters.availability !== 'All') {
      chips.push({
        key: 'availability',
        label: availabilityMap[filters.availability],
        value: filters.availability,
      })
    }
    return chips
  }

  const activeChips = getActiveFilterChips()

  const countryOptions = [
    { value: 'All', label: 'All Countries' },
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'DE', label: 'Germany' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CN', label: 'China' },
  ]

  const certificationOptions = [
    { value: 'All', label: 'All Certifications' },
    { value: 'WHO-GMP', label: 'WHO-GMP' },
    { value: 'FDA', label: 'FDA' },
    { value: 'ISO', label: 'ISO 9001' },
    { value: 'GMP', label: 'GMP' },
  ]

  const dosageFormOptions = [
    { value: 'All', label: 'All Dosage Forms' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Capsule', label: 'Capsule' },
    { value: 'Injection', label: 'Injection' },
    { value: 'Syrup', label: 'Syrup' },
    { value: 'API', label: 'API' },
  ]

  const moqOptions = [
    { value: 'All', label: 'All MOQ' },
    { value: '0-1000', label: '0 - 1,000 units' },
    { value: '1000-10000', label: '1,000 - 10,000 units' },
    { value: '10000+', label: '10,000+ units' },
  ]

  const availabilityOptions = [
    { value: 'All', label: 'All Availability' },
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Made to Order', label: 'Made to Order' },
  ]

  const justify =
    align === 'center'
      ? 'justify-center'
      : align === 'start'
        ? 'justify-start'
        : 'justify-start lg:justify-end'

  const iconClass = 'h-3.5 w-3.5 sm:h-4 sm:w-4'

  const mobileSheetFields = [
    {
      key: 'country',
      label: 'Country',
      options: countryOptions,
      value: draft.country,
      onChange: (v) => handleDraftChange('country', v),
    },
    {
      key: 'certification',
      label: 'Certification',
      options: certificationOptions,
      value: draft.certification,
      onChange: (v) => handleDraftChange('certification', v),
    },
    {
      key: 'dosageForm',
      label: 'Dosage form',
      options: dosageFormOptions,
      value: draft.dosageForm,
      onChange: (v) => handleDraftChange('dosageForm', v),
    },
    {
      key: 'moq',
      label: 'MOQ',
      options: moqOptions,
      value: draft.moq,
      onChange: (v) => handleDraftChange('moq', v),
    },
    {
      key: 'availability',
      label: 'Availability',
      options: availabilityOptions,
      value: draft.availability,
      onChange: (v) => handleDraftChange('availability', v),
    },
  ]

  useEffect(() => {
    if (!sheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  return (
    <div className="w-full min-w-0 overflow-visible">
      {/* Mobile only: compact trigger + bottom sheet (Featured Products) */}
      <div className="lg:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:border-[#3b4ed0]/35 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#3b4ed0]" aria-hidden />
            <span>Filters</span>
            {activeFiltersCount > 0 ? (
              <span className="rounded-full bg-[#3b4ed0] px-2 py-0.5 text-[11px] font-bold text-white">
                {activeFiltersCount}
              </span>
            ) : null}
          </button>
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Clear
            </button>
          ) : null}
        </div>

        {sheetOpen ? (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center sm:p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
              aria-label="Close filters"
              onClick={() => setSheetOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="featured-products-filter-title"
              className="relative z-[101] flex max-h-[min(88dvh,640px)] w-full flex-col rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl sm:mx-auto sm:max-w-lg sm:rounded-3xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 pb-3 pt-4">
                <div className="flex items-center gap-2">
                  <h2 id="featured-products-filter-title" className="text-lg font-bold text-slate-900">
                    Product filters
                  </h2>
                  {activeFiltersCount > 0 ? (
                    <span className="rounded-full bg-[#3b4ed0]/10 px-2 py-0.5 text-xs font-bold text-[#3b4ed0]">
                      {activeFiltersCount} active
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="space-y-5">
                  {mobileSheetFields.map((field, i) => (
                    <div key={field.key}>
                      <label
                        htmlFor={MOBILE_IDS[i]}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {field.label}
                      </label>
                      <div className="relative">
                        <select
                          id={MOBILE_IDS[i]}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/90 py-3.5 pl-4 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-[#3b4ed0] focus:outline-none focus:ring-2 focus:ring-[#3b4ed0]/25"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          {field.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onReset()
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Reset all
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAndClose}
                    className="flex-[1.2] rounded-xl bg-[#3b4ed0] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#3248b8]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Desktop / large screens: original pill filters (unchanged) */}
      <div className="hidden lg:block">
        <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
          <FilterSelect
            aria-label="Country filter"
            value={draft.country}
            onChange={(v) => handleDraftChange('country', v)}
            options={countryOptions}
            variant="pill"
            alignMenu="end"
            icon={<Globe className={iconClass} strokeWidth={2} />}
          />
          <FilterSelect
            aria-label="Certification filter"
            value={draft.certification}
            onChange={(v) => handleDraftChange('certification', v)}
            options={certificationOptions}
            variant="pill"
            alignMenu="end"
            icon={<ShieldCheck className={iconClass} strokeWidth={2} />}
          />
          <FilterSelect
            aria-label="Dosage form filter"
            value={draft.dosageForm}
            onChange={(v) => handleDraftChange('dosageForm', v)}
            options={dosageFormOptions}
            variant="pill"
            alignMenu="end"
            icon={<Pill className={iconClass} strokeWidth={2} />}
          />
          <FilterSelect
            aria-label="MOQ filter"
            value={draft.moq}
            onChange={(v) => handleDraftChange('moq', v)}
            options={moqOptions}
            variant="pill"
            alignMenu="end"
            icon={<Package className={iconClass} strokeWidth={2} />}
          />
          <FilterSelect
            aria-label="Availability filter"
            value={draft.availability}
            onChange={(v) => handleDraftChange('availability', v)}
            options={availabilityOptions}
            variant="pill"
            alignMenu="end"
            icon={<CheckCircle2 className={iconClass} strokeWidth={2} />}
          />

          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:pl-1">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#3b4ed0] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3248b8] focus:outline-none focus:ring-2 focus:ring-[#3b4ed0]/40 focus:ring-offset-2"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <p
          className={`mt-2 text-xs text-gray-500 ${align === 'end' ? 'lg:text-right' : align === 'center' ? 'text-center' : ''}`}
        >
          {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
        </p>
      )}

      {activeChips.length > 0 && (
        <div className={`mt-2 flex flex-wrap items-center gap-2 ${justify}`}>
          <span className="text-xs font-medium text-gray-500">Active:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleRemoveFilter(chip.key)}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterBar
