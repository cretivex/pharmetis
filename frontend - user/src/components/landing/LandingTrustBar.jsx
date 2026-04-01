import { BadgeCheck } from 'lucide-react'
import { CountryFlag } from './ui/CountryFlag'

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
  { value: '150+', label: 'Countries Served' },
  { value: '5-24h', label: 'Average Response' },
  { value: '98.5%', label: 'Satisfied Clients' },
]

const orgLogos = [
  { id: 'WHO', title: 'World Health Organization', tone: 'bg-[#0093d5]' },
  { id: 'FDA', title: 'U.S. Food & Drug Administration', tone: 'bg-[#193e8f]' },
  { id: 'ISO', title: 'International Organization for Standardization', tone: 'bg-[#10385f]' },
]

function Divider() {
  return (
    <span
      className="hidden h-5 w-px shrink-0 bg-gray-200 lg:mx-2 lg:block lg:self-center"
      aria-hidden
    />
  )
}

function FlagTile({ code, label }) {
  return (
    <span
      title={label}
      className="flex h-6 w-6 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white"
    >
      <CountryFlag code={code} label={label} />
    </span>
  )
}

function OrgLogo({ id, title, tone }) {
  return (
    <div
      title={title}
      className="flex h-7 shrink-0 items-center justify-center rounded border border-gray-200 bg-white px-1.5 shadow-sm"
    >
      <span
        className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full text-[8px] font-bold uppercase tracking-wide text-white ${tone}`}
      >
        {id}
      </span>
    </div>
  )
}

export default function LandingTrustBar() {
  return (
    <section className="relative z-10 -mt-5 hidden px-3 pb-1.5 font-sans sm:-mt-6 sm:px-4 md:block lg:px-5">
      <div className="mx-auto max-w-5xl">
        <div
          className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-soft lg:flex-row lg:flex-nowrap lg:items-center lg:justify-between lg:gap-0 lg:overflow-x-auto lg:px-4 lg:py-2"
          role="region"
          aria-label="Trust and credentials"
        >
          {/* 1. Trusted by */}
          <div className="flex min-w-0 flex-col justify-center lg:shrink-0">
            <p className="text-[10px] text-gray-500 sm:text-[11px]">Trusted by</p>
            <p className="text-xs font-semibold leading-tight text-gray-900 sm:text-sm">
              10,000+ Buyers Worldwide
            </p>
          </div>

          <Divider />

          {/* 2. Flags */}
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Global presence">
            {flags.map((f) => (
              <FlagTile key={f.code} code={f.code} label={f.label} />
            ))}
          </div>

          <Divider />

          {/* 3–5. WHO, FDA, ISO */}
          {orgLogos.map((org, i) => (
            <div key={org.id} className="flex items-center">
              {i > 0 && <Divider />}
              <OrgLogo id={org.id} title={org.title} tone={org.tone} />
            </div>
          ))}

          <Divider />

          {/* 6. Verified */}
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 shadow-sm ring-1 ring-green-100/80 sm:text-[11px]">
              <BadgeCheck className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
              Verified Supplier
            </span>
          </div>

          <Divider />

          {/* 7. Stats — horizontal, center-aligned text blocks + vertical dividers (reference img 2) */}
          <div
            className="flex min-w-0 flex-1 flex-col divide-y divide-gray-200 sm:flex-row sm:divide-x sm:divide-y-0 sm:divide-gray-200"
            aria-label="Key statistics"
          >
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex min-w-0 flex-1 flex-col items-center justify-center px-1.5 py-1 text-center first:pt-0 last:pb-0 sm:px-2 sm:py-0 sm:first:pl-0 sm:last:pr-0"
              >
                <p className="text-sm font-bold tabular-nums leading-none text-slate-900 sm:text-[0.9375rem]">
                  {value}
                </p>
                <p className="mt-0.5 max-w-[9rem] text-[10px] leading-tight text-gray-500 sm:text-[11px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
