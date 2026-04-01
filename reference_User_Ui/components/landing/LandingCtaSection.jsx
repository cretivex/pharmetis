import { Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'

export default function LandingCtaSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgb(59 130 246 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(139 92 246 / 0.25), transparent)`,
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand/30 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-500/25 blur-[90px]" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-10 shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] ring-1 ring-white/10 backdrop-blur-xl md:p-14">
          <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-[120%] -translate-x-1/2 bg-gradient-to-b from-brand/40 to-transparent blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200/90">
              <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden />
              Get started
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Start Sourcing Globally Today
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
              Join procurement teams who use Pharmetis to discover compliant bulk supply—with
              verification, documentation, and responsive supplier workflows built in.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="white" size="lg" href="#products" className="min-w-[200px] font-bold">
                Start Sourcing Now
              </Button>
              <Button variant="ghostDark" size="lg" href="#footer" className="min-w-[200px]">
                List Your Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
