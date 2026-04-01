import { useEffect, useState } from 'react'
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { supplierFilters } from '../../data/suppliersCatalog'

const CERT_OPTIONS = [
  { value: 'All', label: 'All certifications' },
  { value: 'WHO-GMP', label: 'WHO-GMP' },
  { value: 'FDA', label: 'FDA' },
  { value: 'ISO 9001', label: 'ISO 9001' },
  { value: 'ISO 13485', label: 'ISO 13485' },
  { value: 'GMP', label: 'GMP' },
  { value: 'cGMP', label: 'cGMP' },
  { value: 'EMA', label: 'EMA' },
  { value: 'MHRA', label: 'MHRA' },
]

const COUNTRY_OPTIONS = [
  { value: 'All', label: 'All countries' },
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'China', label: 'China' },
]

const PRODUCTS_OPTIONS = [
  { value: 'All', label: 'All ranges' },
  { value: '0-200', label: '0 – 200 products' },
  { value: '200-400', label: '200 – 400 products' },
  { value: '400+', label: '400+ products' },
]

const DOSAGE_OPTIONS = [
  { value: 'All', label: 'All dosage forms' },
  { value: 'TABLET', label: 'Tablets' },
  { value: 'CAPSULE', label: 'Capsules' },
  { value: 'INJECTION', label: 'Injections' },
  { value: 'SYRUP', label: 'Syrups' },
  { value: 'CREAM', label: 'Topical' },
]

const MOBILE_LABELS = ['Certification', 'Country', 'Product range', 'Dosage form']
const MOBILE_IDS = ['sup-filter-cert', 'sup-filter-country', 'sup-filter-products', 'sup-filter-dosage']

function countActive(certification, country, totalProducts, dosageForm) {
  let n = 0
  if (certification !== 'All') n += 1
  if (country !== 'All') n += 1
  if (totalProducts !== 'All') n += 1
  if (dosageForm !== 'All') n += 1
  return n
}

export default function SuppliersFilterBar({
  certification,
  country,
  totalProducts,
  dosageForm,
  onCertificationChange,
  onCountryChange,
  onTotalProductsChange,
  onDosageFormChange,
  onReset,
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const configs = [
    {
      label: supplierFilters[0],
      mobileLabel: MOBILE_LABELS[0],
      value: certification,
      onChange: onCertificationChange,
      options: CERT_OPTIONS,
    },
    {
      label: supplierFilters[1],
      mobileLabel: MOBILE_LABELS[1],
      value: country,
      onChange: onCountryChange,
      options: COUNTRY_OPTIONS,
    },
    {
      label: supplierFilters[2],
      mobileLabel: MOBILE_LABELS[2],
      value: totalProducts,
      onChange: onTotalProductsChange,
      options: PRODUCTS_OPTIONS,
    },
    {
      label: supplierFilters[3],
      mobileLabel: MOBILE_LABELS[3],
      value: dosageForm,
      onChange: onDosageFormChange,
      options: DOSAGE_OPTIONS,
    },
  ]

  const activeCount = countActive(certification, country, totalProducts, dosageForm)

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
    <>
      {/* Mobile: compact trigger + bottom sheet */}
      <div className="mb-6 md:mb-0 md:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:border-brand/40 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-brand" aria-hidden />
            <span>Filters</span>
            {activeCount > 0 ? (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
          {activeCount > 0 ? (
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
              aria-labelledby="suppliers-filter-sheet-title"
              className="relative z-[101] flex max-h-[min(88dvh,640px)] w-full flex-col rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl sm:mx-auto sm:max-w-lg sm:rounded-3xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 pb-3 pt-4">
                <div className="flex items-center gap-2">
                  <div className="hidden h-1 w-10 rounded-full bg-slate-200 sm:block" aria-hidden />
                  <h2 id="suppliers-filter-sheet-title" className="text-lg font-bold text-slate-900">
                    Filters
                  </h2>
                  {activeCount > 0 ? (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand">
                      {activeCount} active
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
                  {configs.map((cfg, i) => (
                    <div key={cfg.label}>
                      <label
                        htmlFor={MOBILE_IDS[i]}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {cfg.mobileLabel}
                      </label>
                      <div className="relative">
                        <select
                          id={MOBILE_IDS[i]}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-3.5 pl-4 pr-10 text-sm font-semibold text-slate-900 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                          value={cfg.value}
                          onChange={(e) => cfg.onChange(e.target.value)}
                          aria-label={cfg.label}
                        >
                          {cfg.options.map((o) => (
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
                    onClick={() => setSheetOpen(false)}
                    className="flex-[1.2] rounded-xl bg-brand py-3.5 text-sm font-bold text-white shadow-md hover:bg-brand-hover"
                  >
                    Show results
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tablet & desktop: inline pills */}
      <div className="mb-8 hidden flex-col gap-4 rounded-2xl border border-slate-300/85 bg-white p-4 shadow-[0_4px_20px_-6px_rgba(5,11,29,0.12)] md:flex md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {configs.map((cfg) => (
            <label
              key={cfg.label}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand/35 hover:shadow-md"
            >
              <select
                className="max-w-[200px] cursor-pointer appearance-none border-0 bg-transparent pr-1 text-xs font-bold focus:outline-none focus:ring-0"
                value={cfg.value}
                onChange={(e) => cfg.onChange(e.target.value)}
                aria-label={cfg.label}
              >
                {cfg.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand md:self-center"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset Filters
        </button>
      </div>
    </>
  )
}
