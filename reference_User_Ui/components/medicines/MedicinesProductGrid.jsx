import { ArrowRight, Star, Pill } from 'lucide-react'
import { medicinesProducts } from '../../data/medicinesCatalog'

export default function MedicinesProductGrid({ view = 'grid' }) {
  const isList = view === 'list'

  return (
    <div
      className={
        isList
          ? 'flex flex-col gap-5'
          : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
      }
    >
      {medicinesProducts.map((p) => (
        <article
          key={p.id}
          className={`group relative flex overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/90 transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_40px_-12px_rgba(0,102,255,0.18)] ${
            isList ? 'flex-row' : 'flex-col'
          }`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-violet-400 to-cyan-400 opacity-0 transition duration-300 group-hover:opacity-100" />

          <div
            className={`relative bg-gradient-to-br from-slate-50 via-indigo-50/90 to-violet-100/70 ${
              isList ? 'w-44 shrink-0 sm:w-56' : 'aspect-[4/3] w-full'
            }`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]" />
            {p.badge === 'best-seller' ? (
              <span className="absolute left-3 top-3 z-10 rounded-lg bg-gradient-to-r from-brand to-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg shadow-brand/30">
                Best Seller
              </span>
            ) : p.badge === 'in-stock' ? (
              <span className="absolute left-3 top-3 z-10 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                In Stock
              </span>
            ) : p.inStock ? (
              <span className="absolute left-3 top-3 z-10 rounded-lg bg-emerald-600/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                In Stock
              </span>
            ) : null}
            <div className="relative flex h-full min-h-[8rem] items-center justify-center">
              <div className="rounded-2xl bg-white/80 p-4 shadow-inner ring-1 ring-white transition duration-300 group-hover:scale-105 group-hover:shadow-md">
                <Pill className="h-12 w-12 text-brand/55" strokeWidth={1.25} aria-hidden />
              </div>
            </div>
          </div>

          <div className={`relative flex flex-1 flex-col p-5 ${isList ? 'justify-center' : ''}`}>
            <h3 className="font-bold leading-snug text-slate-900">{p.name}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">API: {p.apiName}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
              <span className="text-base">{p.flag}</span>
              <span className="font-medium">{p.country}</span>
              <span className="text-slate-300">·</span>
              <span className="truncate text-slate-500">{p.manufacturer}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.certs.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand ring-1 ring-brand/15"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" aria-hidden />
              <span className="text-sm font-bold text-slate-800">{p.rating}</span>
              <span className="text-xs text-slate-500">({p.reviews})</span>
            </div>
            <div className={`mt-5 flex gap-2 ${isList ? 'sm:flex-row' : 'flex-col sm:flex-row'}`}>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-brand to-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/25 transition hover:from-brand-hover hover:to-blue-700"
              >
                Send RFQ
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-brand/80 bg-white px-3 py-2.5 text-sm font-bold text-brand transition hover:bg-brand/5"
              >
                View Details
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
