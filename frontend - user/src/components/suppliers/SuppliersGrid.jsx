import { Building2, Heart, Share2, Star } from 'lucide-react'
import { countryToFlagEmoji, stableRatingFromId, stableReviewsFromId } from '../../utils/supplierDisplay'
import { medicineCardHoverClass, medicineCardSurfaceClass } from '../medicines/medicineCardStyles'

function certLabel(supplier) {
  const c = supplier.certifications?.[0]
  if (c) return `${c} certified`
  return 'Certified supplier'
}

function tagsFor(supplier) {
  const certs = supplier.certifications || []
  return certs.slice(0, 3).length ? certs.slice(0, 3) : ['B2B', 'Pharma']
}

export default function SuppliersGrid({ suppliers, onViewProfile, onSendInquiry }) {
  return (
    <section
      id="suppliers-grid"
      className="scroll-mt-28"
      aria-labelledby="verified-suppliers-heading"
    >
      <div className="relative">
        <h2
          id="verified-suppliers-heading"
          className="text-lg font-semibold tracking-tight text-[#050b1d] sm:text-xl"
        >
          Verified suppliers
        </h2>
        <div className="mt-1.5 h-0.5 w-12 rounded-full bg-[#050b1d]/80" />
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Compare credentials and regions, then open a profile or send an inquiry.
        </p>
      </div>

      <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {suppliers.map((s) => {
          const flag = countryToFlagEmoji(s.country)
          const city = s.city || '—'
          const rating = stableRatingFromId(s.id)
          const reviews = stableReviewsFromId(s.id)
          const inStock = (s.totalProducts || 0) > 0

          return (
            <article
              key={s.id}
              className={`group flex flex-col overflow-hidden ${medicineCardSurfaceClass} ${medicineCardHoverClass}`}
            >
              {/* Compact top bar — replaces tall hero block */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/90 bg-slate-50/95 px-2.5 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300/80 bg-white text-slate-600 shadow-sm">
                    <Building2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </div>
                  {inStock && (
                    <span className="hidden min-w-0 truncate rounded border border-emerald-200/90 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800 sm:inline-block">
                      In stock
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {inStock && (
                    <span className="sm:hidden rounded border border-emerald-200/90 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-800">
                      Stock
                    </span>
                  )}
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                    aria-label="Save supplier"
                  >
                    <Heart className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#050b1d]"
                    aria-label="Share supplier"
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-[#050b1d]">
                  {s.name}
                </h3>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
                  <span className="mr-0.5">{flag}</span>
                  {city}, {s.country}
                </p>
                <p className="mt-1 text-[10px] font-medium text-emerald-800">{certLabel(s)}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3 w-3 fill-current" aria-hidden />
                    <span className="font-semibold text-slate-800">{rating}</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{reviews} reviews</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {tagsFor(s).map((t) => (
                    <span
                      key={t}
                      className="rounded border border-slate-300/70 bg-slate-50 px-1.5 py-0 text-[9px] font-medium text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex gap-2 border-t border-slate-200/90 pt-3">
                  <button
                    type="button"
                    onClick={() => onViewProfile(s)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-1 py-2 text-[10px] font-semibold leading-tight text-[#050b1d] transition hover:border-slate-300 hover:bg-slate-50 sm:text-[11px]"
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendInquiry(s)}
                    className="flex-1 rounded-lg bg-neutral-900 px-1 py-2 text-[10px] font-semibold leading-tight text-white transition hover:bg-neutral-800 sm:text-[11px]"
                  >
                    Send inquiry
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
