import { useState, createElement } from 'react'
import {
  ArrowRight,
  Search,
  Shield,
  BadgeCheck,
  Award,
  CheckCircle2,
} from 'lucide-react'

const filterChips = [
  'Product Name',
  'API Name',
  'Brand Name',
  'Therapeutic Area',
  'Manufacturer',
]

const trustItems = [
  { icon: Shield, label: 'WHO-GMP Certified' },
  { icon: BadgeCheck, label: 'FDA Approved' },
  { icon: Award, label: 'ISO Certified' },
  { icon: CheckCircle2, label: '10,000+ Verified Suppliers' },
]

function HeroVisualFallback() {
  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-400/20 to-blue-900/40 shadow-2xl"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="absolute bottom-[18%] left-1/2 flex h-[28%] w-[72%] -translate-x-1/2 items-end justify-center gap-3 rounded-xl bg-violet-300/30 shadow-inner">
        <div className="h-[85%] w-16 rounded-t-lg bg-amber-800/80 shadow-lg ring-1 ring-white/20" />
        <div className="h-[65%] w-12 rounded-t-lg bg-amber-800/70 shadow-lg ring-1 ring-white/20" />
        <div className="h-[75%] w-14 rounded-t-lg bg-cyan-700/60 shadow-lg ring-1 ring-white/20" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(60deg,#fff_0,#fff_1px,transparent_1px,transparent_24px)]" />
    </div>
  )
}

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 ring-1 ring-white/15 transition hover:bg-brand-hover hover:shadow-brand/40 motion-safe:active:scale-[0.98]'

const btnGhost =
  'inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10'

export default function Hero() {
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [heroFailed, setHeroFailed] = useState(false)
  const [activeChip, setActiveChip] = useState('Product Name')

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#061a2f] to-[#041018] pb-20 pt-28 text-white md:pb-32 md:pt-36">
      {/* Animated ambient layers */}
      <div
        className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-[120px] motion-safe:animate-glow-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-gradient-to-t from-brand/10 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <div className="motion-safe:animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100/90 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            B2B marketplace
          </p>
          <h1 className="mt-5 max-w-[22ch] text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            <span className="bg-gradient-to-br from-white via-white to-slate-300 bg-clip-text text-transparent">
              Source Bulk Medicines Directly from Certified Global Manufacturers.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300/95 sm:text-lg">
            Secure, compliant B2B pharmaceutical sourcing with verified suppliers worldwide. Get
            competitive quotes, ensure quality compliance, and streamline your global procurement.
          </p>

          <form className="mt-9 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="hero-search">
              Search medicines
            </label>
            <div className="group flex w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] ring-2 ring-white/20 transition focus-within:ring-brand/60">
              <div className="flex flex-1 items-center gap-2.5 pl-3 sm:pl-4">
                <Search
                  className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-brand"
                  aria-hidden
                />
                <input
                  id="hero-search"
                  type="search"
                  placeholder="Search by product name, API name, brand..."
                  className="min-w-0 flex-1 border-0 bg-transparent py-3.5 pr-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Search filters">
            {filterChips.map((c) => {
              const active = activeChip === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveChip(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-brand text-white shadow-md shadow-brand/40 ring-1 ring-white/20'
                      : 'border border-white/20 bg-white/8 text-white/90 backdrop-blur-sm hover:bg-white/14'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#products" className={btnPrimary}>
              Send Bulk Inquiry
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href="#products" className={btnGhost}>
              Browse Products
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:p-5">
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/90 sm:gap-x-7 sm:text-sm">
              {trustItems.map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  {createElement(icon, {
                    className: 'h-4 w-4 shrink-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]',
                    'aria-hidden': true,
                  })}
                  <span className="font-medium">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex min-h-[280px] justify-center motion-safe:animate-fade-up motion-reduce:animate-none lg:min-h-[440px] lg:justify-end">
          <div className="relative w-full max-w-xl">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand/40 via-violet-500/25 to-cyan-500/10 opacity-90 blur-3xl motion-safe:animate-glow-pulse"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-8 left-1/2 h-44 w-[90%] -translate-x-1/2 rounded-[100%] bg-brand/35 blur-[56px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/50 via-transparent to-transparent"
              aria-hidden
            />

            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/20 ring-offset-4 ring-offset-slate-950/0">
              {!heroFailed ? (
                <img
                  src="/images/hero-pharma.png"
                  alt="Pharmaceutical products on a glowing platform"
                  width={720}
                  height={560}
                  className={`relative z-[1] h-auto w-full object-contain object-center drop-shadow-[0_24px_64px_rgba(0,102,255,0.38)] transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setHeroLoaded(true)}
                  onError={() => setHeroFailed(true)}
                />
              ) : null}
              {(!heroLoaded && !heroFailed) || heroFailed ? (
                <div
                  className={
                    heroFailed
                      ? 'relative'
                      : 'pointer-events-none absolute inset-0 flex items-center justify-center p-4'
                  }
                >
                  <HeroVisualFallback />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
