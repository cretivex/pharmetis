import { Link } from 'react-router-dom'
import { Lock, BadgeCheck, FileCheck, Globe2, Shield } from 'lucide-react'

const benefits = [
  { icon: Lock, label: 'Secure platform & encrypted inquiries' },
  { icon: BadgeCheck, label: 'WHO-GMP & FDA-ready documentation paths' },
  { icon: FileCheck, label: 'Structured RFQs with audit trails' },
  { icon: Globe2, label: 'Global supplier coverage & regional filters' },
]

/** Matches main marketing navbar — professional B2B, not loud consumer gradient */
const NAVY = '#050b1d'

export default function SuppliersCtaSection() {
  return (
    <section className="border-t border-slate-200/80 bg-slate-50/80 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
          {/* ~58% — capabilities */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 lg:col-span-7 lg:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operations
            </p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
              Enterprise-ready sourcing
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Shortlist, verify, and contact suppliers without losing visibility across your team.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2.5">
              {benefits.map((b) => (
                <li key={b.label} className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 text-slate-600">
                    <b.icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-xs font-medium leading-snug text-slate-700">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ~42% — CTA */}
          <div
            className="relative flex flex-col justify-center overflow-hidden rounded-2xl p-5 text-center shadow-md ring-1 ring-white/10 lg:col-span-5 lg:p-6 lg:text-left"
            style={{
              background: `linear-gradient(155deg, ${NAVY} 0%, #0c1a32 48%, #0a1428 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }}
              aria-hidden
            />
            <div className="relative flex flex-col lg:items-start">
              <h3 className="text-base font-semibold leading-snug text-white md:text-lg">
                Start sourcing globally today
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Join buyers sourcing bulk medicines from certified manufacturers—profiles, RFQs, and audit-ready
                trails in one place.
              </p>
              <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="#suppliers-grid"
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/20 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 shadow-sm transition hover:bg-slate-100 sm:flex-initial sm:min-w-[8.5rem]"
                >
                  Browse suppliers
                </a>
                <Link
                  to="/send-rfq"
                  className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:flex-initial sm:min-w-[8.5rem]"
                >
                  Send inquiry
                </Link>
              </div>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[10px] font-medium text-white/55 lg:justify-start">
                <Shield className="h-3 w-3 shrink-0 text-amber-200/90" aria-hidden />
                <span>Secure payments</span>
                <span className="text-white/35">·</span>
                <span>WHO GMP</span>
                <span className="text-white/35">·</span>
                <span>ISO</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
