import { ArrowRight, CheckCircle2 } from 'lucide-react'

const bullets = [
  {
    title: 'Industry Experts',
    body: 'Our team brings deep experience in pharma supply, compliance, and global logistics.',
  },
  {
    title: 'Global Network',
    body: 'We connect you with verified partners across markets and dosage forms.',
  },
  {
    title: 'Compliance Focused',
    body: 'Documentation and verification are built into the platform—not bolted on later.',
  },
]

export default function AboutWhoWeAre() {
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Who We Are</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Pharmetis is a B2B marketplace built for procurement teams who need reliable sourcing,
              clear supplier credentials, and a streamlined path from RFQ to fulfillment.
            </p>
            <ul className="mt-8 space-y-5">
              {bullets.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{b.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute -left-6 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand/30 to-blue-400/20 blur-2xl lg:block"
              aria-hidden
            />
            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/80">
              <img
                src="/images/about-team-professional.png"
                alt="Healthcare professional with tablet"
                width={720}
                height={560}
                className="h-full w-full object-cover object-[center_20%]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
