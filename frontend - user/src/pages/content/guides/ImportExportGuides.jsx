import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Anchor, FileCheck, Globe2, PackageSearch, ScrollText, Truck } from 'lucide-react'
import ContentPageShell from '../../../components/content/ContentPageShell'
import { setPageSeo } from '../../../utils/seoPage'

const STEPS = [
  {
    n: '01',
    title: 'Clarify product classification',
    body: 'Harmonized codes, controlled substance schedules, and finished vs. API status affect licensing and declarations. Align your technical specification with the correct classification before you lock incoterms or pricing.',
    icon: PackageSearch,
  },
  {
    n: '02',
    title: 'Define commercial terms',
    body: 'Incoterms allocate risk, cost, and insurance between buyer and seller. Document the agreed term in your RFQ and quotation so logistics and finance teams share one source of truth.',
    icon: Truck,
  },
  {
    n: '03',
    title: 'Plan documentation early',
    body: 'Typical expectations include commercial invoice, packing list, certificate of analysis, and manufacturer licenses—exact lists vary by corridor. Build a checklist per lane and update it when regulations change.',
    icon: ScrollText,
  },
  {
    n: '04',
    title: 'Use verified sourcing channels',
    body: (
      <>
        Marketplaces that verify supplier credentials reduce the time spent on initial screening. Browse{' '}
        <Link to="/suppliers" className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-2 hover:text-blue-800">
          verified suppliers
        </Link>{' '}
        and compare offerings in the{' '}
        <Link to="/medicines" className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-2 hover:text-blue-800">
          medicines catalog
        </Link>{' '}
        before you issue an RFQ.
      </>
    ),
    icon: Anchor,
  },
  {
    n: '05',
    title: 'Align with quality and compliance',
    body: (
      <>
        Import rules are only one layer—your quality agreement and release testing still govern fitness for use.
        See how Pharmetis approaches supplier verification on our{' '}
        <Link to="/compliance" className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-2 hover:text-blue-800">
          compliance page
        </Link>
        .
      </>
    ),
    icon: FileCheck,
  },
]

function ImportExportGuides() {
  useEffect(() => {
    return setPageSeo({
      title: 'Import & Export Guides — Pharmaceutical Trade | Pharmetis',
      description:
        'Practical guidance on documentation, incoterms, and customs considerations for importing and exporting pharmaceutical products.',
    })
  }, [])

  return (
    <ContentPageShell
      eyebrow="Guides"
      title="Import & export guides for pharmaceutical buyers"
      subtitle="A structured starting point for cross-border procurement—pair these steps with your freight forwarder and compliance team."
    >
      <div className="space-y-10">
        <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 to-white p-5 md:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
            <Globe2 className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-[15px] leading-relaxed text-slate-600 md:text-base">
            Follow these steps as a checklist. Timelines and document names change by corridor—always confirm
            with your logistics partner and regulatory counsel for your specific lanes.
          </p>
        </div>

        <div className="space-y-6">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="relative flex flex-col gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft transition hover:border-slate-300/90 hover:shadow-soft-lg md:flex-row md:gap-8 md:p-8"
            >
              <div className="flex shrink-0 flex-row items-center gap-4 md:w-36 md:flex-col md:items-start md:border-r md:border-slate-100 md:pr-6">
                <span className="font-display text-4xl font-bold tabular-nums leading-none text-slate-200 md:text-5xl">
                  {step.n}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white md:h-12 md:w-12">
                  <step.icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold text-slate-900 md:text-2xl">{step.title}</h2>
                <div className="mt-3 text-[15px] leading-relaxed text-slate-600 md:text-base">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ContentPageShell>
  )
}

export default ImportExportGuides
