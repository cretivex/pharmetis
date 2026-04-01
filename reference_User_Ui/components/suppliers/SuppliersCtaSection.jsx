import { Lock, BadgeCheck, FileCheck, Globe2 } from 'lucide-react'

const benefits = [
  { icon: Lock, label: 'Secure platform & encrypted inquiries' },
  { icon: BadgeCheck, label: 'WHO-GMP & FDA-ready documentation paths' },
  { icon: FileCheck, label: 'Structured RFQs with audit trails' },
  { icon: Globe2, label: 'Global supplier coverage & regional filters' },
]

export default function SuppliersCtaSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-8 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Operations</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Enterprise-ready sourcing
            </h2>
            <p className="mt-3 text-slate-600">
              Everything you need to shortlist, verify, and contact suppliers without losing
              visibility.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li
                  key={b.label}
                  className="flex gap-4 rounded-xl border border-transparent p-2 transition hover:border-brand/15 hover:bg-white"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-blue-500/10 text-brand ring-1 ring-brand/15">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold leading-relaxed text-slate-700">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#063a8a] via-brand to-slate-900 p-8 text-white shadow-2xl shadow-brand/25 ring-1 ring-white/15 md:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,255,255,0.12),transparent_50%)]" />
            <div className="relative">
              <h3 className="text-xl font-bold md:text-2xl">Start Sourcing Globally Today</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Browse verified supplier profiles or send a targeted inquiry to your shortlist.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#suppliers-grid"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100"
                >
                  Browse Suppliers
                </a>
                <a
                  href="#suppliers-grid"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-white/50 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Send Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
