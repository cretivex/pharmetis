import { BadgeCheck, Star } from 'lucide-react'
import { Section } from './ui/Section'
import { Button } from './ui/Button'
import { CountryFlag } from './ui/CountryFlag'
import SupplierCardSkeleton from './SupplierCardSkeleton'

/** Rough map for flag display */
const COUNTRY_CODE = {
  India: 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  Germany: 'DE',
  China: 'CN',
  Brazil: 'BR',
  Canada: 'CA',
  'South Africa': 'ZA',
}

const SKELETON_COUNT = 8

export default function LandingVerifiedSuppliers({
  suppliers,
  isLoading = false,
  isError = false,
  onRetry,
  onSendInquiry,
}) {
  return (
    <Section
      id="suppliers"
      eyebrow="Network"
      title="Verified Suppliers"
      subtitle="Partner with audited manufacturers and distributors across major markets."
      className="relative overflow-hidden bg-slate-50/80 py-8 md:py-11"
      innerClassName="relative"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" aria-hidden />

      <div className="relative mt-4 flex justify-end">
        <Button
          variant="outline"
          size="md"
          to="/suppliers"
          className="sm:ml-auto !rounded-lg border-gray-200 text-sm font-medium text-gray-800 shadow-sm hover:bg-white"
        >
          View All Suppliers
        </Button>
      </div>

      {isError && (
        <div className="relative mt-5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-6 text-center">
          <p className="text-sm font-medium text-red-800">Unable to load suppliers. Please try again.</p>
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry()}
              className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-4">
        {isLoading && !isError
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SupplierCardSkeleton key={i} />)
          : null}

        {!isLoading && !isError && suppliers.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-gray-500">No suppliers to display.</p>
        ) : null}

        {!isLoading &&
          !isError &&
          suppliers.map((s) => {
            const slug = s.slug || s.id
            const certs = (s.certifications || []).slice(0, 4)
            const initial = (s.name || '?').slice(0, 1).toUpperCase()
            const flagCode = COUNTRY_CODE[s.country] || 'IN'
            return (
              <article
                key={s.id}
                className="group flex flex-col rounded-lg border border-gray-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-gray-900/[0.03] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)]"
              >
                <div className="flex gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-gray-200/80">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-blue-600">
                        {initial}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1">
                      <h3 className="line-clamp-2 text-xs font-semibold leading-tight tracking-tight text-gray-900">
                        {s.name}
                      </h3>
                      <BadgeCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                        strokeWidth={2.5}
                        aria-label="Verified"
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3 w-3 fill-current" aria-hidden />
                      <span className="text-[11px] font-semibold text-gray-800">4.9</span>
                      <span className="text-[11px] text-gray-400">(80+)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="flex h-5 w-7 shrink-0 overflow-hidden rounded border border-gray-200/90 bg-white shadow-sm">
                    <CountryFlag code={flagCode} label={s.country} />
                  </span>
                  <span className="truncate font-medium text-gray-700">{s.country || '—'}</span>
                </div>

                <div className="mt-2 flex min-h-[1.5rem] flex-wrap gap-1">
                  {certs.map((c) => (
                    <span
                      key={c}
                      className="inline-flex rounded border border-blue-200/90 bg-blue-50/90 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-blue-800"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
                  <span className="font-semibold text-gray-800">{s.totalProducts ?? 0}</span> products
                  <span className="mx-1 text-gray-300">·</span>
                  <span className="font-semibold text-gray-800">{s.yearsInBusiness ?? '—'}</span> yrs
                  <span className="mx-1 text-gray-300">·</span>
                  <span className="font-semibold text-gray-800">{'<'}2h</span> response
                </p>

                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 !rounded-lg border-gray-200 !py-2 !text-[11px] font-semibold text-gray-800 hover:bg-slate-50"
                    to={`/suppliers/${slug}`}
                  >
                    View Profile
                  </Button>
                  <button
                    type="button"
                    onClick={() => onSendInquiry(s)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-white shadow-sm shadow-black/15 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/40 focus:ring-offset-1"
                  >
                    Send Inquiry
                  </button>
                </div>
              </article>
            )
          })}
      </div>
    </Section>
  )
}
