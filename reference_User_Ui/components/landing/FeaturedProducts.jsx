import { ChevronDown, Pill, Star } from 'lucide-react'
import { featuredProducts } from '../../data/landingMock'
import { Section } from '../ui/Section'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const filters = [
  'All Countries',
  'All Certifications',
  'All Dosage Forms',
  'All MOQ',
  'All Availability',
]

export default function FeaturedProducts() {
  return (
    <Section
      id="products"
      eyebrow="Catalog"
      title="Featured Products"
      subtitle="Curated listings from verified manufacturers with transparent certifications, MOQ, and indicative pricing."
      className="relative overflow-hidden bg-white/80 py-16 backdrop-blur-sm md:py-24"
      innerClassName="relative"
    >
      <div className="pattern-dots pattern-grid-fade pointer-events-none absolute inset-0 opacity-45" aria-hidden />

      <div className="relative mt-10 flex flex-col justify-end gap-6 md:flex-row md:items-end md:justify-between">
        <div className="hidden md:block" aria-hidden />
        <div className="flex flex-wrap gap-2 md:justify-end">
          {filters.map((f) => (
            <label
              key={f}
              className="group inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-md shadow-slate-200/40 ring-1 ring-white backdrop-blur-sm transition hover:border-brand/35 hover:shadow-lg"
            >
              <select
                className="max-w-[140px] cursor-pointer appearance-none border-0 bg-transparent pr-1 text-xs font-bold focus:outline-none focus:ring-0"
                defaultValue={f}
                aria-label={f}
              >
                <option>{f}</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-brand" />
            </label>
          ))}
        </div>
      </div>

      <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((p) => (
          <article
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] ring-1 ring-white/90 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_24px_48px_-12px_rgba(0,102,255,0.2)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-violet-400 to-cyan-400 opacity-0 transition group-hover:opacity-100" />
            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 via-indigo-50/80 to-violet-100/70">
              <span className="absolute left-3 top-3 z-10 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/25">
                In Stock
              </span>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(255,255,255,0.5),transparent_55%)]" />
              <div className="flex h-full items-center justify-center">
                <div className="rounded-2xl bg-white/85 p-4 shadow-inner ring-1 ring-white transition duration-300 group-hover:scale-105 group-hover:shadow-lg">
                  <Pill className="h-12 w-12 text-brand/65" strokeWidth={1.25} aria-hidden />
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-bold text-slate-900">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.manufacturer}</p>
              <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MOQ</p>
                  <p className="text-sm font-bold text-slate-800">{p.moq}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</p>
                  <p className="text-sm font-bold text-brand">{p.priceFrom}</p>
                  <p className="text-[10px] text-slate-400">/ unit</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" aria-hidden />
                <span className="text-sm font-bold text-slate-800">{p.rating}</span>
                <span className="text-sm text-slate-500">({p.reviews})</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.certs.map((c) => (
                  <Badge key={c} variant="brand">
                    {c}
                  </Badge>
                ))}
                <Badge variant="default">{p.form}</Badge>
              </div>
              <div className="mt-5 flex flex-1 flex-col gap-2 sm:flex-row">
                <Button variant="primary" size="sm" className="flex-1" to="/medicines">
                  Send RFQ
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" to="/medicines">
                  View Details
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
