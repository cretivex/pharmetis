import { Search, Send, ShieldCheck, Handshake } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Search & Shortlist',
    body: 'Filter by certification, dosage form, MOQ, and region to build a shortlist in minutes.',
  },
  {
    icon: Send,
    title: 'Send RFQ',
    body: 'Submit structured inquiries with quantities and timelines—suppliers respond on-platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification',
    body: 'Documentation and facility credentials are reviewed so you deal with verified partners.',
  },
  {
    icon: Handshake,
    title: 'Connect & Deal',
    body: 'Finalize terms, logistics, and compliance directly with your chosen manufacturer.',
  },
]

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-slate-50/90 py-16 backdrop-blur-[2px] md:py-24">
      <div className="pattern-dots pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            A straightforward path from discovery to compliant procurement.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute left-0 right-0 top-[2.25rem] hidden h-0.5 bg-gradient-to-r from-transparent via-brand/25 to-transparent lg:block"
            aria-hidden
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-6 text-center shadow-md shadow-slate-200/40 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/50"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-blue-600 text-white shadow-lg shadow-brand/30 ring-4 ring-white">
                  <step.icon className="h-7 w-7" aria-hidden />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-brand">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
