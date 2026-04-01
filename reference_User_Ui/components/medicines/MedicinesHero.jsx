import { Search, LayoutGrid, List, ChevronDown } from 'lucide-react'
import ContactSupplierWidget from './ContactSupplierWidget'

const filterDropdowns = [
  'Product Name',
  'API Name',
  'Therapeutic Area',
  'Manufacturer',
  'All (923)',
]

export default function MedicinesHero({ view, onViewChange }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0c1630] to-[#1a0f2e] pb-12 pt-24 text-white md:pb-16 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-500/25 blur-[110px] motion-safe:animate-glow-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-16 h-96 w-96 rounded-full bg-brand/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[140%] -translate-x-1/2 bg-gradient-to-t from-brand/15 to-transparent blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full glass-chip px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/95">
              Catalog
            </p>
            <h1 className="mt-4 bg-gradient-to-br from-white via-white to-blue-200/90 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">
              Medicines
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              Search verified listings by product, API, therapeutic area, or manufacturer.
            </p>

            <form
              className="mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-stretch"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="medicines-search">
                Search medicines
              </label>
              <div className="group flex flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-2 ring-white/25 transition focus-within:ring-brand/70">
                <div className="flex flex-1 items-center gap-2 pl-3 sm:pl-4">
                  <Search
                    className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-brand"
                    aria-hidden
                  />
                  <input
                    id="medicines-search"
                    type="search"
                    placeholder="Search products, APIs, manufacturers…"
                    className="min-w-0 flex-1 border-0 bg-transparent py-3.5 pr-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {filterDropdowns.map((label) => (
                <label
                  key={label}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition hover:bg-white/12"
                >
                  <select
                    className="max-w-[140px] cursor-pointer appearance-none border-0 bg-transparent pr-1 text-xs font-semibold text-white focus:outline-none focus:ring-0"
                    aria-label={label}
                    defaultValue={label}
                  >
                    <option className="text-slate-900">{label}</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/70" />
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-2xl glass-chip px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/85">
                <span className="font-semibold text-white">
                  <span className="tabular-nums text-lg">1,456</span>
                  <span className="ml-1.5 text-white/70">results</span>
                </span>
                <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                <div className="flex flex-wrap items-center gap-2">
                  {['WHO-GMP', 'FDA', 'ISO'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
                <span className="tabular-nums text-white/90">5–24h response</span>
                <span className="font-medium text-emerald-300">96.5% satisfaction</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-white/90">
                <span className="text-white/60">Sort by</span>
                <select className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40">
                  <option className="text-slate-900">Popularity</option>
                  <option className="text-slate-900">Newest</option>
                  <option className="text-slate-900">Rating</option>
                </select>
              </label>
              <div
                className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1 shadow-inner"
                role="group"
                aria-label="View mode"
              >
                <button
                  type="button"
                  onClick={() => onViewChange('grid')}
                  className={`rounded-lg p-2.5 transition ${
                    view === 'grid'
                      ? 'bg-white text-brand shadow-md shadow-slate-900/20'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-pressed={view === 'grid'}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange('list')}
                  className={`rounded-lg p-2.5 transition ${
                    view === 'list'
                      ? 'bg-white text-brand shadow-md shadow-slate-900/20'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-pressed={view === 'list'}
                >
                  <List className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 lg:ml-4 lg:pt-2">
            <div className="lg:sticky lg:top-24">
              <ContactSupplierWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
