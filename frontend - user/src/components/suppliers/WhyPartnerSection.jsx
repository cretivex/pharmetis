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
    <section className="relative overflow-hidden bg-[#f4f6f9] py-12 md:py-16">
      <div
        className="pattern-dots pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-semibold tracking-tight text-[#050b1d] sm:text-2xl md:text-[1.65rem]">
          Why Partner with Certified Suppliers?
        </h2>
        <p className="mx-auto mt-2.5 max-w-2xl text-center text-sm leading-relaxed text-slate-600 md:text-[0.9375rem]">
          Reduce counterparty risk with structured verification and transparent credentials.
        </p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_12px_40px_-12px_rgba(5,11,29,0.12)] md:p-6"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100/90 bg-blue-50/90 text-[#050b1d] transition group-hover:bg-blue-50">
                <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-semibold leading-snug text-[#050b1d] md:text-[0.9375rem]">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 md:text-[0.8125rem] md:leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
