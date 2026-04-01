import { Shield, FileCheck, Lock, Users } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

const complianceTiles = [
  {
    icon: Shield,
    title: 'WHO-GMP',
    body: 'Manufacturing aligned with international good manufacturing practice expectations.',
  },
  {
    icon: FileCheck,
    title: 'FDA Approved',
    body: 'Access suppliers familiar with US regulatory documentation and audit expectations.',
  },
  {
    icon: Lock,
    title: 'Escrow Payment',
    body: 'Optional structured payment flows to reduce counterparty risk on large orders.',
  },
  {
    icon: Users,
    title: 'Verified Suppliers',
    body: 'Onboarding checks and ongoing monitoring for business legitimacy and track record.',
  },
]

export default function LandingComplianceCta() {
  return (
    <section
      id="compliance"
      className="relative scroll-mt-24 overflow-hidden bg-[#f1f5f9] py-8 md:py-12"
    >
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand sm:text-xs">Trust</p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem] md:text-[1.85rem]">
              Enterprise Compliance
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">
              Built for teams that need traceability, documentation, and partner verification.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-3.5">
              {complianceTiles.map((c) => {
                const Icon = c.icon
                return (
                  <Card key={c.title} className="rounded-xl p-4" hover>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand/15 to-blue-500/10 text-brand ring-1 ring-brand/15">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{c.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">{c.body}</p>
                    <a
                      href="#compliance"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand transition hover:gap-2"
                    >
                      Learn more
                      <span aria-hidden>→</span>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="relative lg:sticky lg:top-24">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-blue-900/40 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 shadow-[0_0_40px_-12px_rgba(59,130,246,0.4)] ring-1 ring-white/10 md:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgb(59 130 246 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(139 92 246 / 0.25), transparent)`,
                }}
              />
              <div className="relative text-center">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200/90">
                  <Sparkles className="h-4 w-4 text-cyan-300" aria-hidden />
                  Get started
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-white md:text-2xl">
                  Start Sourcing Globally Today
                </h3>
                <p className="mx-auto mt-3 max-w-md text-xs text-slate-300 sm:text-sm">
                  Join procurement teams who use Pharmetis to discover compliant bulk supply—with
                  verification, documentation, and responsive supplier workflows built in.
                </p>
                <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:justify-center">
                  <Button variant="white" size="md" href="#products" className="min-w-[160px] font-bold">
                    Start Sourcing Now
                  </Button>
                  <Button variant="ghostDark" size="md" href="#footer" className="min-w-[160px]">
                    List Your Products
                  </Button>
                </div>
                <p className="mt-4 text-[11px] text-slate-400 sm:text-xs">
                  Get quotes within 24 hours · No registration required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
