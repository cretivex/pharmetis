import { BadgeCheck, Network, RefreshCw } from 'lucide-react'

const cards = [
  {
    icon: BadgeCheck,
    title: 'Verified Manufacturers',
    body: 'Onboarded suppliers with documented credentials and ongoing monitoring.',
  },
  {
    icon: Network,
    title: 'Comprehensive Offerings',
    body: 'Search across APIs, finished dosage forms, regions, and MOQs in one place.',
  },
  {
    icon: RefreshCw,
    title: 'Stringent Compliance',
    body: 'Built for teams that need traceability, documentation, and audit-ready records.',
  },
]

export default function AboutWhyChoose() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Why Choose Pharmetis?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          Built for procurement teams who want speed without sacrificing safety.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 shadow-md shadow-slate-200/50 ring-1 ring-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                <c.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
