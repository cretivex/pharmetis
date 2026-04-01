import { useState, createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  Shield,
  BadgeCheck,
  Award,
  CheckCircle2,
} from 'lucide-react'

const FILTER_CHIPS = [
  { label: 'Product Name', type: 'product' },
  { label: 'API Name', type: 'api' },
  { label: 'Brand Name', type: 'brand' },
  { label: 'Therapeutic Area', type: 'therapeutic' },
  { label: 'Manufacturer', type: 'manufacturer' },
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
      className="relative mx-auto aspect-[5/4] w-full max-w-[340px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-400/20 to-blue-900/40 shadow-lg sm:max-w-sm"
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
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand/25 ring-1 ring-white/15 transition duration-200 hover:bg-brand-hover active:scale-[0.98] sm:text-sm'

const btnGhost =
  'inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition duration-200 hover:border-white/55 hover:bg-white/10 active:scale-[0.98] sm:text-sm'

export default function LandingHero() {
  const navigate = useNavigate()
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [heroFailed, setHeroFailed] = useState(false)
  const [activeChip, setActiveChip] = useState(FILTER_CHIPS[0])
  const [query, setQuery] = useState('')

  const runSearch = (e) => {
    e?.preventDefault()
    const q = String(query).trim()
    if (!q) return
    navigate(
      `/medicines?search=${encodeURIComponent(q)}&type=${encodeURIComponent(activeChip.type)}`
    )
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#1a365d] to-[#0c1929] pb-10 pt-16 text-white sm:pb-12 md:pb-14 md:pt-20">
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

      <div className="relative mx-auto grid max-w-6xl gap-6 px-4 sm:gap-8 sm:px-5 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-6">
        <div className="motion-safe:animate-fade-up">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100/90 backdrop-blur-md sm:px-3 sm:py-1 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            B2B marketplace
          </p>
          <h1 className="mt-3 max-w-[26ch] font-display text-balance text-2xl font-bold leading-snug tracking-tight sm:text-[1.6rem] md:text-[1.75rem] lg:text-[1.9rem] lg:leading-tight">
            <span className="bg-gradient-to-br from-white via-white to-slate-300 bg-clip-text text-transparent">
              Source Bulk Medicines Directly from Certified Global Manufacturers.
            </span>
          </h1>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-300/95 sm:text-[0.95rem]">
            Secure, compliant B2B pharmaceutical sourcing with verified suppliers worldwide. Get
            competitive quotes, ensure quality compliance, and streamline your global procurement.
          </p>

          <form className="mt-5 flex flex-col gap-2.5" onSubmit={runSearch}>
            <label className="sr-only" htmlFor="hero-search">
              Search medicines
            </label>
            <div className="group flex w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg shadow-black/20 ring-1 ring-white/25 transition duration-200 focus-within:shadow-xl focus-within:ring-brand/40 sm:max-w-lg">
              <div className="flex flex-1 items-center gap-2 pl-2.5 sm:pl-3">
                <Search
                  className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-brand sm:h-[1.125rem] sm:w-[1.125rem]"
                  aria-hidden
                />
                <input
                  id="hero-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product name, API name, brand..."
                  className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:py-3"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center bg-brand px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-hover sm:px-5 sm:text-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Search filters">
            {FILTER_CHIPS.map((c) => {
              const active = activeChip.label === c.label
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setActiveChip(c)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition sm:px-3 sm:text-xs ${
                    active
                      ? 'bg-brand text-white shadow-md shadow-brand/40 ring-1 ring-white/20'
                      : 'border border-white/20 bg-white/8 text-white/90 backdrop-blur-sm hover:bg-white/14'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate('/send-rfq')} className={btnPrimary}>
              Send Bulk Inquiry
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => navigate('/medicines')} className={btnGhost}>
              Browse Products
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-md sm:p-3">
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-white/90 sm:gap-x-4 sm:text-xs">
              {trustItems.map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                  {createElement(icon, {
                    className:
                      'h-3.5 w-3.5 shrink-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.45)] sm:h-4 sm:w-4',
                    'aria-hidden': true,
                  })}
                  <span className="font-medium">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex min-h-[200px] justify-center motion-safe:animate-fade-up motion-reduce:animate-none lg:min-h-[260px] lg:justify-end">
          <div className="relative w-full max-w-[340px] sm:max-w-sm">
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/35 via-violet-500/20 to-cyan-500/10 opacity-90 blur-2xl motion-safe:animate-glow-pulse"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-4 left-1/2 h-28 w-[85%] -translate-x-1/2 rounded-[100%] bg-brand/30 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/50 via-transparent to-transparent"
              aria-hidden
            />

            <div className="relative overflow-hidden rounded-xl ring-1 ring-white/20 ring-offset-2 ring-offset-slate-950/0 aspect-[5/4]">
              {!heroFailed ? (
                <img
                  src="/landing-hero-pharma.png"
                  alt="Pharmaceutical products on a glowing platform"
                  width={480}
                  height={400}
                  className={`relative z-[1] h-full w-full object-cover object-center drop-shadow-[0_16px_40px_rgba(0,102,255,0.3)] transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
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
