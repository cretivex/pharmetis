import { Star, ArrowRight, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { medicineCardHoverClass, medicineCardSurfaceClass } from './medicineCardStyles'

function flagEmoji(country) {
  const m = {
    India: '🇮🇳',
    'United States': '🇺🇸',
    Germany: '🇩🇪',
    'United Kingdom': '🇬🇧',
    China: '🇨🇳',
    Brazil: '🇧🇷',
    Canada: '🇨🇦',
    'South Africa': '🇿🇦',
  }
  return m[country] || '🌐'
}

function demoRating(id) {
  const n = Number(id) || 0
  return {
    score: (4 + (n % 6) / 10).toFixed(1),
    reviews: 40 + (n % 120) * 2,
  }
}

function certBadgeLabel(raw) {
  const s = String(raw).toUpperCase()
  if (s.includes('WHO')) return 'WHO'
  if (s.includes('FDA')) return 'FDA'
  if (s.includes('ISO')) return 'ISO'
  if (s.includes('DMF')) return 'DMF'
  if (s.includes('COA')) return 'COA'
  return String(raw).slice(0, 8)
}

function formatCompareTo(brand) {
  if (!brand || brand === 'N/A') return '—'
  const s = String(brand).trim()
  return /®|™/.test(s) ? s : `${s}®`
}

function packSizeDisplay(p) {
  if (p.packSize) return p.packSize
  if (p.packagingType) return p.packagingType
  return '—'
}

function ProductSpecTable({ product, onDetails }) {
  const compareTo = formatCompareTo(product.brand)
  const ndc = product.ndcNumber || '—'
  const strength = product.strength || '—'
  const pack = packSizeDisplay(product)

  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-300/80 bg-slate-50/90">
      <table className="w-full min-w-[200px] table-fixed border-collapse text-left">
        <thead>
          <tr className="bg-slate-100/95">
            <th className="px-1 py-0.5 text-[7px] font-bold uppercase leading-tight tracking-wide text-slate-600">
              Compare to
            </th>
            <th className="px-1 py-0.5 text-[7px] font-bold uppercase leading-tight tracking-wide text-slate-600">
              NDC
            </th>
            <th className="px-1 py-0.5 text-[7px] font-bold uppercase leading-tight tracking-wide text-slate-600">
              Strength
            </th>
            <th className="px-1 py-0.5 text-[7px] font-bold uppercase leading-tight tracking-wide text-slate-600">
              Pack
            </th>
            <th className="w-7 px-0 py-0.5 text-center text-[7px] font-bold uppercase text-slate-600">
              Det.
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="truncate px-1 py-1 text-[9px] font-semibold leading-tight text-slate-900">{compareTo}</td>
            <td className="truncate px-1 py-1 font-mono text-[9px] text-slate-800">{ndc}</td>
            <td className="truncate px-1 py-1 text-[9px] font-medium text-slate-900">{strength}</td>
            <td className="truncate px-1 py-1 text-[9px] text-slate-800">{pack}</td>
            <td className="px-0 py-1 text-center">
              <button
                type="button"
                onClick={onDetails}
                className="inline-flex rounded p-0.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                aria-label="View product details"
              >
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function MedicinesProductGrid({
  products,
  view = 'grid',
  onSendRFQ,
  onViewDetails,
  gridClassName,
}) {
  const isList = view === 'list'

  if (!products?.length) return null

  const gridLayout =
    gridClassName ??
    (isList ? 'flex flex-col gap-3' : 'grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3')

  return (
    <div className={gridLayout}>
      {products.map((p) => {
        const certs = (p.certifications || []).slice(0, 3)
        const avail = p.availability || ''
        const inStock = String(avail).toLowerCase().includes('stock')
        const { score, reviews } = demoRating(p.id)
        const moqDisplay = p.moq || 'Contact'
        const detailPath = `/medicines/${p.slug || p.id}`

        return (
          <article
            key={p.id}
            className={`flex h-full min-h-0 max-w-full flex-col overflow-hidden ${medicineCardSurfaceClass} ${medicineCardHoverClass}`}
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2">
              {/* Fixed-height title row so multi-line titles don’t shift buttons */}
              <div className="mb-1 flex min-h-[2.75rem] items-start justify-between gap-1.5 border-b border-slate-100 pb-1.5">
                <h3 className="line-clamp-2 min-h-[2.5rem] min-w-0 flex-1 text-left text-[12px] font-semibold leading-[1.25] text-slate-900">
                  {p.name}
                </h3>
                <Link
                  to={detailPath}
                  className="inline-flex max-w-[45%] shrink-0 items-start gap-0.5 text-[9px] font-medium leading-tight text-blue-600 hover:underline sm:max-w-none"
                >
                  <Download className="mt-0.5 h-2.5 w-2.5 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Prescribing Information</span>
                  <span className="sm:hidden">Rx info</span>
                </Link>
              </div>

              {/* Fills space above buttons; keeps CTAs bottom-aligned across cards */}
              <div className="flex min-h-0 flex-1 flex-col gap-1">
                <ProductSpecTable product={p} onDetails={() => onViewDetails(p)} />

                <p className="line-clamp-1 text-[9px] leading-snug text-slate-600">
                  <span
                    className={
                      inStock ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-800'
                    }
                  >
                    {inStock ? 'In Stock' : avail || '—'}
                  </span>
                  <span className="text-slate-300"> · </span>
                  {p.manufacturer}
                  <span className="text-slate-300"> · </span>
                  <span className="inline-flex items-center gap-0.5">
                    <span aria-hidden>{flagEmoji(p.country)}</span>
                    {p.country}
                  </span>
                  {p.dosageForm ? (
                    <>
                      <span className="text-slate-300"> · </span>
                      {p.dosageForm}
                    </>
                  ) : null}
                </p>

                {certs.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5">
                    {certs.map((c) => (
                      <span
                        key={c}
                        className="rounded border border-blue-200/70 bg-blue-50 px-0.5 py-px text-[7px] font-bold uppercase tracking-wide text-blue-700"
                      >
                        {certBadgeLabel(c)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 border-t border-slate-100 pt-1 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                    <span className="font-semibold tabular-nums text-slate-800">{score}</span>
                    <span className="text-slate-400">({reviews})</span>
                  </span>
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span className="min-w-0 truncate">
                    MOQ: <span className="font-medium text-slate-700">{moqDisplay}</span>
                  </span>
                </div>
              </div>

              <div className="mt-2 flex shrink-0 gap-1.5 border-t border-slate-100/90 pt-2">
                <button
                  type="button"
                  onClick={() => onSendRFQ(p)}
                  className="inline-flex min-h-[1.875rem] flex-1 items-center justify-center rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-semibold leading-tight text-white shadow-sm shadow-black/15 transition hover:bg-neutral-800 active:bg-black"
                >
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails(p)}
                  className="inline-flex min-h-[1.875rem] flex-1 items-center justify-center gap-0.5 rounded-lg border border-neutral-900 bg-white px-2 py-1 text-[10px] font-semibold leading-tight text-neutral-900 transition hover:bg-neutral-50 active:bg-neutral-100"
                >
                  <span className="min-w-0 truncate">View Details</span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-blue-600 opacity-90" aria-hidden />
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
