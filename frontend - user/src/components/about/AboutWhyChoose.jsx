import { Network, RefreshCw, Send, ShieldCheck } from 'lucide-react'

const cards = [
  {
    icon: ShieldCheck,
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

function ContactPreviewCard() {
  return (
    <div
      role="region"
      aria-label="Contact preview"
      className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.14)] lg:col-span-3"
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
        Reach the team
      </p>
      <h3 className="mt-2 text-left text-xl font-bold tracking-tight text-slate-950">Contact Us</h3>

      {/* Form preview — decorative fields; CTA links to full form */}
      <div className="mt-6 space-y-3">
        <div className="h-10 w-full rounded-full border border-slate-200/95 bg-slate-50/80" aria-hidden />
        <div className="h-10 w-full rounded-full border border-slate-200/95 bg-slate-50/80" aria-hidden />
        <a
          href="#contact"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
          Send Message
        </a>
      </div>
    </div>
  )
}

export default function AboutWhyChoose() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-sky-600">
            Platform advantages
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-[#0f172a] md:text-[2rem] md:leading-tight">
            Why Choose Pharmetis?
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-500 md:text-[1.0625rem]">
            Built for procurement teams who want speed without sacrificing safety.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:items-stretch lg:gap-7">
          {cards.map((c) => (
            <article
              key={c.title}
              className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white px-7 pb-8 pt-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-12px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-px hover:border-slate-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-14px_rgba(15,23,42,0.12)] lg:col-span-3"
            >
              <div className="flex justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-sm">
                  <c.icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-[#0f172a]">{c.title}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{c.body}</p>
            </article>
          ))}

          <ContactPreviewCard />
        </div>
      </div>
    </section>
  )
}
