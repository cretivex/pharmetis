import { Shield, FlaskConical, ShieldCheck, Globe2 } from 'lucide-react'

const items = [
  {
    icon: Shield,
    title: 'ISO & GMP Certified',
    body: 'Partners are evaluated against internationally recognized manufacturing standards.',
  },
  {
    icon: FlaskConical,
    title: 'Comprehensive Offerings',
    body: 'APIs, finished dosage forms, and region-specific documentation in one workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Stringent Quality Control',
    body: 'Traceability and documentation designed for audit readiness and buyer confidence.',
  },
  {
    icon: Globe2,
    title: 'Global Distribution',
    body: 'Source from verified suppliers across major pharma hubs with clear logistics signals.',
  },
]

export default function WhyPartnerSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 md:py-24">
      <div className="pattern-dots pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Why Partner with Certified Suppliers?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
          Reduce counterparty risk with structured verification and transparent credentials.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-6 text-center shadow-md shadow-slate-200/40 ring-1 ring-white transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-blue-500/10 text-brand ring-1 ring-brand/20 transition group-hover:from-brand/25">
                <item.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
