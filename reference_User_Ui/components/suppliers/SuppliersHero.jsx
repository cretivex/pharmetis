import { ChevronDown } from 'lucide-react'

const quickFilters = ['ISO GMP Certified', 'All Products', 'All Regions']

export default function SuppliersHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#071228] to-[#1e1045] pb-16 pt-24 text-white md:pb-20 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none absolute -left-32 top-8 h-[22rem] w-[22rem] rounded-full bg-brand/25 blur-[110px] motion-safe:animate-glow-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[120%] -translate-x-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/90 backdrop-blur-md">
            Supplier network
          </p>
          <h1 className="mt-5 text-balance bg-gradient-to-br from-white via-white to-blue-200/90 bg-clip-text text-3xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-4xl lg:text-[2.65rem]">
            Trusted Suppliers of Bulk Medicines — Source Globally Certified Manufacturers
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            Discover audited partners with transparent certifications, response SLAs, and verified
            facility credentials—built for enterprise procurement teams.
          </p>

          <form className="mt-8 max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="suppliers-search">
              Search suppliers
            </label>
            <div className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-2 ring-white/20 transition focus-within:ring-brand/60">
              <input
                id="suppliers-search"
                type="search"
                placeholder="Search by company, country, or certification…"
                className="min-w-0 flex-1 border-0 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="shrink-0 bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-hover"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((f) => (
              <button
                key={f}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition hover:bg-white/18"
              >
                {f}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/35 via-blue-500/25 to-violet-600/30 blur-3xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl ring-2 ring-white/25 shadow-2xl">
              <img
                src="/images/hero-pharma.png"
                alt="Pharmaceutical products from certified suppliers"
                width={640}
                height={480}
                className="h-auto w-full object-contain"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
