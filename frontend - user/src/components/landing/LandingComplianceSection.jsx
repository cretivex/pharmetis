import { Shield, Building2, Lock, Users, FileCheck } from 'lucide-react'
import { Section } from './ui/Section'
import { Card } from './ui/Card'

const cards = [
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
    icon: Building2,
    title: 'ISO Certified',
    body: 'Quality management systems certified to global ISO standards where applicable.',
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

export default function LandingComplianceSection() {
  return (
    <Section
      id="compliance"
      eyebrow="Trust"
      title="Enterprise Compliance"
      subtitle="Built for teams that need traceability, documentation, and partner verification."
      className="relative overflow-hidden bg-slate-100/90 py-16 md:py-24"
      innerClassName="relative"
    >
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand/10 blur-3xl" aria-hidden />
      <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
          <Card key={c.title} className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-blue-500/10 text-brand ring-1 ring-brand/15">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
            <a
              href="#compliance"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand transition hover:gap-2"
            >
              Learn more
              <span aria-hidden>→</span>
            </a>
          </Card>
        )})}
      </div>
    </Section>
  )
}
