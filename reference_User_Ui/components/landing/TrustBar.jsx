import { createElement } from 'react'
import { BadgeCheck, Clock, Globe2, ThumbsUp } from 'lucide-react'
import { CountryFlag } from '../ui/CountryFlag'

const flags = [
  { code: 'US', label: 'United States' },
  { code: 'IN', label: 'India' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'BR', label: 'Brazil' },
  { code: 'CA', label: 'Canada' },
  { code: 'ZA', label: 'South Africa' },
]

const stats = [
  { icon: Globe2, value: '150+', label: 'Countries Served' },
  { icon: Clock, value: '5–24h', label: 'Average Response' },
  { icon: ThumbsUp, value: '98.5%', label: 'Satisfied Clients' },
]

const orgStyles = {
  WHO: 'bg-[#0093d5]',
  FDA: 'bg-[#193e8f]',
  ISO: 'bg-[#10385f]',
}

function FlagTile({ code, label }) {
  return (
    <span
      title={label}
      className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:ring-brand/30"
    >
      <CountryFlag code={code} label={label} />
    </span>
  )
}

function OrgMark({ name, subtitle }) {
  const circle = orgStyles[name] ?? 'bg-slate-700'
  return (
    <div className="flex max-w-[11rem] items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 shadow-sm sm:max-w-none">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold uppercase tracking-wide text-white shadow-inner ${circle}`}
      >
        {name}
      </span>
      <span className="hidden min-w-0 text-[10px] leading-snug text-slate-600 sm:block">
        {subtitle}
      </span>
    </div>
  )
}

export default function TrustBar() {
  return (
    <section className="relative z-10 -mt-6 px-4 pb-4 sm:-mt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          className="flex flex-col gap-5 rounded-[2rem] border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 px-4 py-5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] ring-1 ring-white sm:gap-4 sm:px-6 sm:py-4 md:flex-row md:flex-wrap md:items-center md:justify-between lg:gap-6 lg:px-8"
          role="region"
          aria-label="Trust and credentials"
        >
          {/* Trusted by */}
          <div className="flex shrink-0 flex-col border-b border-slate-200/80 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trusted by</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
              10,000<span className="text-brand">+</span>
            </p>
            <p className="text-sm font-medium text-slate-600">Buyers Worldwide</p>
          </div>

          {/* Flags */}
          <div
            className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6"
            aria-label="Global presence"
          >
            {flags.map((f) => (
              <FlagTile key={f.code} code={f.code} label={f.label} />
            ))}
          </div>

          {/* Org marks */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <OrgMark name="WHO" subtitle="World Health Organization" />
            <OrgMark name="FDA" subtitle="U.S. Food & Drug Administration" />
            <OrgMark name="ISO" subtitle="International Organization for Standardization" />
          </div>

          {/* Verified badge */}
          <div className="flex shrink-0 items-center border-b border-slate-200/80 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md shadow-slate-200/80 ring-1 ring-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-inner shadow-emerald-900/20">
                <BadgeCheck className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-sm font-bold text-slate-800">Verified Supplier</span>
            </div>
          </div>

          {/* KPIs */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:justify-end">
            {stats.map(({ icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/15">
                  {createElement(icon, { className: 'h-4 w-4', 'aria-hidden': true })}
                </span>
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none text-slate-900">{value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
