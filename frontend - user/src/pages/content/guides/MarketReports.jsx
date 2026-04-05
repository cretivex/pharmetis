import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import ContentPageShell from '../../../components/content/ContentPageShell'
import { setPageSeo } from '../../../utils/seoPage'

const REGIONS = [
  {
    region: 'South Asia',
    focus:
      'Growing demand for generics and contract manufacturing; watch local pricing policy and tender cycles.',
    accent: 'from-rose-500/10 via-white to-orange-50/40',
  },
  {
    region: 'Southeast Asia',
    focus:
      'Diverse registration paths; lead times for first-time importers can vary widely by product class.',
    accent: 'from-cyan-500/10 via-white to-emerald-50/40',
  },
  {
    region: 'Middle East & Africa',
    focus: 'Cold chain and last-mile constraints can dominate total landed cost—model scenarios early.',
    accent: 'from-amber-500/10 via-white to-yellow-50/40',
  },
  {
    region: 'Latin America',
    focus: 'Currency and payment terms often weigh as heavily as product price in annual planning.',
    accent: 'from-green-500/10 via-white to-lime-50/40',
  },
  {
    region: 'Europe & North America',
    focus:
      'Mature regulatory frameworks; differentiation increasingly comes from supply reliability and data packages.',
    accent: 'from-indigo-500/10 via-white to-violet-50/40',
  },
]

function MarketReports() {
  useEffect(() => {
    return setPageSeo({
      title: 'Country & Market Reports — Pharma Sourcing | Pharmetis',
      description:
        'High-level market notes for pharmaceutical buyers planning regional sourcing, registration, and supply strategy.',
    })
  }, [])

  return (
    <ContentPageShell
      eyebrow="Guides"
      title="Country & market reports"
      subtitle="Snapshot themes by region—use as a conversation starter with your local regulatory and commercial teams."
    >
      <div className="space-y-10">
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 md:p-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600 md:text-[17px]">
            Country-level strategy blends <strong className="text-slate-800">regulation</strong>,{' '}
            <strong className="text-slate-800">reimbursement</strong>, and{' '}
            <strong className="text-slate-800">operational reality</strong> on the ground. The notes below are
            intentionally high level; pair them with your own market access research. Explore products on{' '}
            <Link
              to="/medicines"
              className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-4 hover:text-blue-800"
            >
              Pharmetis
            </Link>{' '}
            and compare suppliers by region in the{' '}
            <Link
              to="/suppliers"
              className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-4 hover:text-blue-800"
            >
              supplier directory
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((row) => (
            <article
              key={row.region}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br ${row.accent} p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg`}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <MapPin className="h-4 w-4 text-blue-600" aria-hidden />
                Region
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 md:text-xl">{row.region}</h2>
              <p className="mt-3 flex-grow text-sm leading-relaxed text-slate-600 md:text-[15px]">{row.focus}</p>
              <div
                className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/40 blur-2xl transition group-hover:bg-white/60"
                aria-hidden
              />
            </article>
          ))}
        </div>

        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 md:text-sm">
          These summaries are for planning discussions only—not investment, legal, or medical advice.
        </p>
      </div>
    </ContentPageShell>
  )
}

export default MarketReports
