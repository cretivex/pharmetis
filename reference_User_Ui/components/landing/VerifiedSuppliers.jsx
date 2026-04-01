import { BadgeCheck } from 'lucide-react'
import { verifiedSuppliers } from '../../data/landingMock'
import { Section } from '../ui/Section'
import { Button } from '../ui/Button'

export default function VerifiedSuppliers() {
  return (
    <Section
      id="suppliers"
      eyebrow="Network"
      title="Verified Suppliers"
      subtitle="Partner with audited manufacturers and distributors across major markets."
      className="relative overflow-hidden bg-gradient-to-b from-slate-50/95 via-white to-slate-50 py-16 md:py-24"
      innerClassName="relative"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-brand/8 blur-3xl" aria-hidden />

      <div className="relative mt-10 flex justify-end">
        <Button variant="outline" size="md" to="/suppliers">
          View All Suppliers
        </Button>
      </div>

      <div className="relative mt-8 flex flex-col gap-4">
        {verifiedSuppliers.map((s) => (
          <article
            key={s.id}
            className="group flex flex-col gap-5 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.1)] ring-1 ring-white/90 backdrop-blur-sm transition duration-300 hover:border-brand/25 hover:shadow-[0_16px_40px_-12px_rgba(0,102,255,0.12)] sm:flex-row sm:items-center sm:gap-8 sm:p-6"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-violet-500/15 text-2xl font-bold text-brand shadow-inner ring-2 ring-brand/15">
              {s.name.slice(0, 1)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Verified" />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                <span className="mr-1.5 text-lg leading-none">{s.flag}</span>
                {s.city ? `${s.city}, ${s.country}` : s.country}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.certs.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200/80"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-bold text-slate-900">{s.products}+</span> products ·{' '}
                <span className="font-bold text-slate-900">{s.years}</span> years active
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:w-48">
              <Button variant="outline" size="sm" className="w-full" to="/suppliers">
                View Profile
              </Button>
              <Button variant="primary" size="sm" className="w-full" to="/suppliers">
                Send Inquiry
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
