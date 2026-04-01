import { ArrowRight } from 'lucide-react'

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#071a2f] to-[#041018] pb-10 pt-8 text-white md:pb-14 md:pt-10">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-[22rem] w-[22rem] rounded-full bg-brand/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-violet-500/15 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/90">About</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.12]">
            About Pharmetis
          </h1>
          <p className="mt-2 text-lg font-medium text-white/95 sm:text-xl">
            Empowering Global Pharmaceutical Sourcing
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[0.9375rem]">
            We connect buyers with certified manufacturers worldwide—so you can source bulk
            medicines with confidence, transparency, and compliance built into every step.
          </p>
          <a
            href="#contact"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 ring-1 ring-white/10 transition hover:bg-brand-hover"
          >
            Get In Touch
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/35 via-violet-500/20 to-cyan-500/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-6 left-1/2 h-36 w-[85%] -translate-x-1/2 rounded-[100%] bg-brand/30 blur-[48px]"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-xl ring-1 ring-white/20 aspect-video w-full">
              <img
                src="/about-hero-medicine.png"
                alt="Pharmaceutical products on a glowing platform"
                className="h-full w-full object-cover object-center drop-shadow-[0_16px_48px_rgba(0,102,255,0.3)]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
