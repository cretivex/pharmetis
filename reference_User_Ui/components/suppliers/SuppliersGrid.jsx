import { Building2, Heart, Share2, Star } from 'lucide-react'
import { suppliersList } from '../../data/suppliersCatalog'

export default function SuppliersGrid() {
  return (
    <section
      id="suppliers-grid"
      className="scroll-mt-28"
      aria-labelledby="verified-suppliers-heading"
    >
      <div className="relative">
        <h2
          id="verified-suppliers-heading"
          className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
        >
          Verified Suppliers
        </h2>
        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-brand to-violet-500" />
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          Compare certifications, ratings, and regions—then open a profile or send a direct inquiry.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {suppliersList.map((s) => (
          <article
            key={s.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/90 transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_40px_-12px_rgba(0,102,255,0.15)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-blue-400 to-violet-400 opacity-0 transition group-hover:opacity-100" />

            <div className="relative aspect-[5/3] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
              {s.inStock && (
                <span className="absolute left-3 top-3 z-10 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                  In Stock
                </span>
              )}
              <div className="absolute right-2 top-2 z-10 flex gap-1">
                <button
                  type="button"
                  className="rounded-lg bg-white/95 p-1.5 text-slate-500 shadow-md ring-1 ring-slate-200/80 transition hover:scale-105 hover:text-rose-500"
                  aria-label="Save supplier"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white/95 p-1.5 text-slate-500 shadow-md ring-1 ring-slate-200/80 transition hover:scale-105 hover:text-brand"
                  aria-label="Share supplier"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.45),transparent_60%)]" />
              <div className="relative flex h-full items-center justify-center">
                <div className="rounded-2xl bg-white/85 p-6 shadow-inner ring-1 ring-white transition duration-300 group-hover:scale-105">
                  <Building2 className="h-14 w-14 text-brand/45" strokeWidth={1.25} aria-hidden />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-bold text-slate-900">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-600">
                <span className="mr-1 text-base">{s.flag}</span>
                {s.city}, {s.country}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-700">{s.certLabel}</p>

              <div className="mt-2 flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" aria-hidden />
                <span className="text-sm font-bold text-slate-800">{s.rating}</span>
                <span className="text-xs text-slate-500">({s.reviews} reviews)</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200/80"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-gradient-to-r from-brand to-blue-600 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/25 transition hover:from-brand-hover hover:to-blue-700"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
