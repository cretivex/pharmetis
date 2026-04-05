import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ClipboardList, Layers, ShieldCheck } from 'lucide-react'
import ContentPageShell from '../../../components/content/ContentPageShell'
import { setPageSeo } from '../../../utils/seoPage'

const SECTIONS = [
  {
    title: 'GMP and documentation expectations',
    body: 'Good manufacturing practice expectations underpin batch release decisions. Buyers should define which documents they require before shipment—batch records, stability summaries, and certificates of analysis are common starting points depending on product type.',
    icon: ClipboardList,
    accent: 'from-violet-500/15 to-fuchsia-500/10',
  },
  {
    title: 'FDA, EMA, and WHO-aligned contexts',
    body: "Different agencies emphasize overlapping but non-identical controls. Map your supplier's approvals and inspection history to the markets where you will distribute, and close gaps with audits or technical agreements where needed.",
    icon: Layers,
    accent: 'from-sky-500/15 to-blue-500/10',
  },
  {
    title: 'Supplier qualification on marketplaces',
    body: (
      <>
        A verified marketplace profile accelerates first-pass screening; your team still owns ongoing
        qualification. Use{' '}
        <Link to="/suppliers" className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-2 hover:text-blue-800">
          supplier profiles
        </Link>{' '}
        to shortlist partners, then run your standard vendor approval workflow.
      </>
    ),
    icon: Building2,
    accent: 'from-emerald-500/15 to-teal-500/10',
  },
  {
    title: 'Serialization and traceability',
    body: 'Track-and-trace rules continue to evolve. Ensure data exchange formats and hand-off points with logistics providers are specified in contracts and tested before high-volume lanes go live.',
    icon: ShieldCheck,
    accent: 'from-amber-500/15 to-orange-500/10',
  },
]

/**
 * Editorial compliance guides — distinct from platform /compliance (verification & certifications UI).
 */
function ComplianceGuides() {
  useEffect(() => {
    return setPageSeo({
      title: 'Compliance Guides — Pharma Regulatory & Quality | Pharmetis',
      description:
        'Educational guides on GMP expectations, documentation, and quality agreements for pharmaceutical importers and buyers.',
    })
  }, [])

  return (
    <ContentPageShell
      eyebrow="Guides"
      title="Compliance guides for global pharmaceutical trade"
      subtitle="Educational content to complement your own SOPs and legal counsel—not a substitute for jurisdiction-specific advice."
    >
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl"
            aria-hidden
          />
          <p className="relative text-[15px] leading-relaxed text-slate-700 md:text-base">
            <strong className="text-slate-900">Note:</strong> This section covers{' '}
            <em>regulatory and quality topics</em> for buyers. For how Pharmetis verifies suppliers on the
            platform, visit{' '}
            <Link
              to="/compliance"
              className="font-semibold text-blue-800 underline decoration-amber-700/30 underline-offset-4 hover:text-blue-900"
            >
              Compliance & certifications
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-6 md:gap-8">
          {SECTIONS.map((section) => (
            <article
              key={section.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br ${section.accent} p-6 shadow-soft transition hover:shadow-soft-lg md:p-8`}
            >
              <div className="flex flex-col gap-5 md:flex-row md:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-soft md:h-16 md:w-16">
                  <section.icon className="h-7 w-7 md:h-8 md:w-8" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">{section.title}</h2>
                  <div className="mt-3 text-[15px] leading-relaxed text-slate-600 md:text-base">{section.body}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ContentPageShell>
  )
}

export default ComplianceGuides
