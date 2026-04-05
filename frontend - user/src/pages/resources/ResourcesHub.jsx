import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, Globe, Newspaper, Scale, Sparkles } from 'lucide-react'
import Container from '../../components/ui/Container'
import { setPageSeo } from '../../utils/seoPage'

const LINKS = [
  {
    to: '/blog',
    title: 'Blog',
    description: 'Long-form insights on sourcing, RFQs, and verified supplier relationships.',
    icon: BookOpen,
    chip: 'Editorial',
  },
  {
    to: '/industry-news',
    title: 'Industry news',
    description: 'Regulation, logistics, and supply chain signals that affect procurement.',
    icon: Newspaper,
    chip: 'Briefings',
  },
  {
    to: '/guides/import-export',
    title: 'Import & export guides',
    description: 'Documentation, incoterms, and lane planning for cross-border trade.',
    icon: Globe,
    chip: 'Guides',
  },
  {
    to: '/guides/compliance-guides',
    title: 'Compliance guides',
    description: 'GMP context, quality agreements, and traceability—education, not legal advice.',
    icon: Scale,
    chip: 'Guides',
  },
  {
    to: '/guides/market-reports',
    title: 'Country & market reports',
    description: 'Regional snapshots to align with local regulatory and commercial teams.',
    icon: FileText,
    chip: 'Markets',
  },
]

function ResourcesHub() {
  useEffect(() => {
    return setPageSeo({
      title: 'Resources — Blog, Guides & Market Insights | Pharmetis',
      description:
        'Resources for pharmaceutical buyers: blog, industry news, import/export guides, compliance guides, and country market reports.',
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#050b1d] via-[#0a1628] to-[#0f172a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-violet-500/25 blur-3xl animate-glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-[280px] w-[280px] rounded-full bg-cyan-500/15 blur-3xl"
          aria-hidden
        />

        <Container>
          <div className="relative py-14 sm:py-16 md:py-20 lg:py-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300/90" aria-hidden />
              Resources
            </div>
            <h1 className="max-w-4xl font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              Insights for pharmaceutical buyers
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
              Free articles and guides for sourcing, compliance awareness, and regional planning. When you are
              ready to execute, explore the{' '}
              <Link to="/medicines" className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-200">
                catalog
              </Link>{' '}
              or meet verified partners in the{' '}
              <Link to="/suppliers" className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-200">
                supplier directory
              </Link>
              .
            </p>
          </div>
        </Container>
      </header>

      <div className="relative z-[1] -mt-8 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="container-custom">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {LINKS.map(({ to, title, description, icon: Icon, chip }) => (
              <li key={to} className={to === '/blog' ? 'sm:col-span-2 lg:col-span-2' : ''}>
                <Link
                  to={to}
                  className="group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-soft-xl md:p-7"
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-2xl transition group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative mb-3 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {chip}
                  </span>
                  <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-soft">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h2 className="relative font-display text-xl font-bold text-slate-900 transition group-hover:text-blue-800 md:text-2xl">
                    {title}
                  </h2>
                  <p className="relative mt-2 flex-grow text-sm leading-relaxed text-slate-600 md:text-[15px]">
                    {description}
                  </p>
                  <span className="relative mt-5 inline-flex items-center text-sm font-semibold text-blue-700">
                    Open
                    <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-slate-200/80 bg-gradient-to-br from-slate-900 via-[#0c1424] to-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]"
          aria-hidden
        />
        <Container>
          <div className="relative flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight md:text-xl">
                Start sourcing on Pharmetis
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-400">
                Create a buyer account to send RFQs, compare quotations, and manage orders in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100"
              >
                Create buyer account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to="/medicines"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Browse medicines
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default ResourcesHub
