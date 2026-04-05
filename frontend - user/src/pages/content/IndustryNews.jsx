import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, TrendingUp } from 'lucide-react'
import ContentPageShell from '../../components/content/ContentPageShell'
import { setPageSeo } from '../../utils/seoPage'

const TAG_STYLES = {
  Regulatory: 'bg-violet-100 text-violet-800 ring-violet-500/15',
  Logistics: 'bg-sky-100 text-sky-800 ring-sky-500/15',
  'Supply chain': 'bg-amber-100 text-amber-900 ring-amber-500/15',
}

const HEADLINES = [
  {
    title: 'Regulators continue to emphasize data integrity in cross-border shipments',
    summary:
      'Expect closer scrutiny of batch records, chain-of-custody, and serialization data when products move between jurisdictions.',
    tag: 'Regulatory',
  },
  {
    title: 'Cold chain capacity remains a bottleneck in several emerging markets',
    summary:
      'Buyers planning temperature-sensitive lines should validate lane capabilities early in the RFQ process.',
    tag: 'Logistics',
  },
  {
    title: 'Consolidation among API manufacturers affects lead times for niche molecules',
    summary:
      'Diversifying qualified sources and maintaining safety stock are recurring themes for procurement teams.',
    tag: 'Supply chain',
  },
]

function IndustryNews() {
  useEffect(() => {
    return setPageSeo({
      title: 'Industry News — Pharma Trade & Regulation | Pharmetis',
      description:
        'Industry news and trends in pharmaceutical trade, regulation, logistics, and global B2B sourcing.',
    })
  }, [])

  return (
    <ContentPageShell
      eyebrow="Industry news"
      title="Trends affecting global pharma trade"
      subtitle="Curated notes on regulation, logistics, and supply dynamics—useful context when you plan purchases and RFQs."
    >
      <div className="space-y-12">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 md:p-8">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl"
            aria-hidden
          />
          <p className="relative max-w-2xl text-base leading-relaxed text-slate-600 md:text-[17px]">
            Markets shift with policy updates, capacity constraints, and regional demand. Use these snapshots
            alongside your own regulatory and quality assessments. When you are ready to engage suppliers, start
            from our{' '}
            <Link
              to="/medicines"
              className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-4 hover:text-blue-800"
            >
              medicines catalog
            </Link>{' '}
            or open an RFQ after{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-4 hover:text-blue-800"
            >
              registering
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-slate-900">
            <Newspaper className="h-6 w-6 shrink-0 text-slate-700" aria-hidden />
            Briefings
          </h2>
          <ol className="relative space-y-0 border-l-2 border-slate-200 pl-0 md:pl-2">
            {HEADLINES.map((item, i) => (
              <li key={i} className="relative pb-10 pl-8 last:pb-0 md:pl-10">
                <span
                  className="absolute -left-[9px] top-1.5 flex h-[18px] w-[18px] rounded-full border-4 border-white bg-blue-600 shadow-sm ring-2 ring-slate-200 md:-left-[11px]"
                  aria-hidden
                />
                <article className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-6 shadow-soft transition hover:shadow-soft-lg md:p-7">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${TAG_STYLES[item.tag] || 'bg-slate-100 text-slate-700 ring-slate-500/10'}`}
                  >
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5 opacity-80" aria-hidden />
                    {item.tag}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold leading-snug text-slate-900 md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{item.summary}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>

        <p className="rounded-xl bg-slate-100/80 px-4 py-3 text-center text-xs leading-relaxed text-slate-500 md:text-sm">
          Editorial summaries for context only—not legal or regulatory advice. Consult qualified advisors for
          decisions affecting your business.
        </p>
      </div>
    </ContentPageShell>
  )
}

export default IndustryNews
