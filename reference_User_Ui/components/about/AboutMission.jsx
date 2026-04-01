import { Globe2, Handshake, ShieldCheck, BarChart3 } from 'lucide-react'

const pillars = [
  {
    icon: Handshake,
    title: 'Trusted Partnerships',
    body: 'Long-term relationships with audited manufacturers and distributors across key markets.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assurance',
    body: 'Rigorous vetting and documentation so you can trust the products you procure.',
  },
  {
    icon: BarChart3,
    title: 'Regulatory Compliance',
    body: 'Structured workflows aligned with WHO-GMP, FDA, and ISO expectations.',
  },
  {
    icon: Globe2,
    title: 'Global Access',
    body: 'Discover and compare suppliers across regions without losing visibility or control.',
  },
]

export default function AboutMission() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Our Mission</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="space-y-4 text-lg leading-relaxed text-slate-600">
            <p>
              Pharmetis exists to simplify how organizations source bulk medicines—by combining
              verified supplier data, compliance signals, and responsive tools so procurement teams
              can move faster without compromising quality.
            </p>
            <p>
              We believe global access should be paired with transparent credentials and clear
              communication between buyers and manufacturers.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/80">
            <img
              src="/images/about-team-professional.png"
              alt="Medical team collaborating with digital tools"
              width={720}
              height={480}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-violet-500/10" />
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm ring-1 ring-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/15">
                <p.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
