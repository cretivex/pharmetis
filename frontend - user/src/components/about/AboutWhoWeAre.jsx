import { ArrowRight, Check, Globe2 } from 'lucide-react'

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
    <section className="relative isolate overflow-hidden bg-slate-50 py-16 md:py-24">
      {/* Layered atmosphere — restrained, print-quality */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(99,102,241,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.9))]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Copy column */}
          <div className="relative z-[1] lg:col-span-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-blue-600/90">
              About Pharmetis
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl md:leading-[1.15]">
              Who We Are
            </h2>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-[1.7] text-slate-600">
              <strong className="font-semibold text-slate-900">Pharmetis</strong> is a{' '}
              <strong className="font-semibold text-slate-900">B2B marketplace</strong> built for{' '}
              <strong className="font-semibold text-slate-900">procurement teams</strong> who need
              reliable sourcing, clear{' '}
              <strong className="font-semibold text-slate-900">supplier</strong> credentials, and a
              streamlined path from <strong className="font-semibold text-slate-900">RFQ</strong> to
              fulfillment.
            </p>

            <ul className="mt-8 space-y-0 rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-sm">
              {bullets.map((b) => (
                <li
                  key={b.title}
                  className="flex gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-white/90 sm:px-5 sm:py-[1.125rem]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_4px_14px_-3px_rgba(37,99,235,0.55)] ring-2 ring-white">
                    <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{b.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.65)] ring-1 ring-white/20 transition hover:shadow-[0_14px_44px_-10px_rgba(37,99,235,0.75)] hover:brightness-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Contact Us
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>

          {/* Visual column — globe watermark + framed image */}
          <div className="relative lg:col-span-7">
            <div className="pointer-events-none absolute -right-8 top-1/2 -z-10 -translate-y-1/2 opacity-[0.07]">
              <Globe2 className="h-[28rem] w-[28rem] text-blue-600" strokeWidth={0.4} aria-hidden />
            </div>

            <div className="relative mx-auto max-w-2xl lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-blue-400/25 via-transparent to-indigo-400/20 opacity-80 blur-xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-[0_32px_64px_-24px_rgba(15,23,42,0.35),0_0_0_1px_rgba(15,23,42,0.06)] ring-1 ring-white/60">
                <img
                  src="/about-who-we-are-pharma.png"
                  alt="Medical professionals collaborating in pharmaceutical facility"
                  width={900}
                  height={640}
                  className="aspect-[4/3] w-full object-cover object-center sm:aspect-[16/11] lg:min-h-[420px] lg:aspect-auto"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-700/25 via-blue-500/5 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-900/5" />

                <a
                  href="#contact"
                  className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-xl bg-slate-950/75 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-slate-950/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
