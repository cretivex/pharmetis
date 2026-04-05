import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookMarked, Calendar } from 'lucide-react'
import ContentPageShell from '../../components/content/ContentPageShell'
import { setPageSeo } from '../../utils/seoPage'

const POSTS = [
  {
    slug: 'sourcing-bulk-apis-2025',
    title: 'Sourcing bulk APIs in 2025: what buyers should verify first',
    excerpt:
      'Regulatory alignment, supplier credentials, and documentation discipline remain the foundation of successful pharmaceutical procurement.',
    date: 'March 2025',
    featured: true,
  },
  {
    slug: 'rfq-best-practices-pharma',
    title: 'RFQ best practices for pharmaceutical procurement teams',
    excerpt:
      'Clear specifications, incoterms, and lead-time expectations reduce back-and-forth and speed up quotation cycles.',
    date: 'February 2025',
    featured: false,
  },
  {
    slug: 'verified-suppliers-marketplaces',
    title: 'Why verified supplier marketplaces reduce compliance risk',
    excerpt:
      'Centralized credential review and audit trails complement your own quality agreements and incoming goods checks.',
    date: 'January 2025',
    featured: false,
  },
]

function Blog() {
  useEffect(() => {
    return setPageSeo({
      title: 'Blog — Pharmaceutical Sourcing & B2B Trade | Pharmetis',
      description:
        'Articles on pharmaceutical sourcing, RFQs, supplier verification, and global B2B trade from Pharmetis.',
    })
  }, [])

  const featured = POSTS.find((p) => p.featured)
  const rest = POSTS.filter((p) => !p.featured)

  return (
    <ContentPageShell
      eyebrow="Blog"
      title="Insights for pharmaceutical buyers"
      subtitle="Practical perspectives on sourcing, compliance, and working with verified suppliers on a global B2B marketplace."
    >
      <div className="space-y-12 md:space-y-14">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl"
            aria-hidden
          />
          <p className="relative max-w-2xl text-base leading-relaxed text-slate-600 md:text-[17px]">
            Whether you procure finished dosage forms or active ingredients, success depends on{' '}
            <span className="font-semibold text-slate-800">clear requirements</span>,{' '}
            <span className="font-semibold text-slate-800">traceable documentation</span>, and{' '}
            <span className="font-semibold text-slate-800">partners you can qualify</span>. Explore the{' '}
            <Link
              to="/suppliers"
              className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 transition hover:text-blue-800"
            >
              supplier directory
            </Link>{' '}
            or browse{' '}
            <Link
              to="/medicines"
              className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 transition hover:text-blue-800"
            >
              medicines
            </Link>{' '}
            when you are ready to shortlist products.
          </p>
        </div>

        {featured && (
          <section aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-slate-900 md:text-2xl">
              <BookMarked className="h-6 w-6 text-blue-600" aria-hidden />
              Featured
            </h2>
            <div className="group relative block overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#050b1d] to-slate-900 p-8 text-white shadow-soft-lg md:p-10">
              <div
                className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl transition group-hover:bg-blue-400/35"
                aria-hidden
              />
              <div className="relative flex flex-col gap-4 md:max-w-[85%]">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-300">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {featured.date}
                </span>
                <h3 className="font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                  {featured.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-300 md:text-lg">{featured.excerpt}</p>
                <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  Full article — coming soon
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="more-heading">
          <h2 id="more-heading" className="mb-6 font-display text-lg font-bold text-slate-900 md:text-xl">
            More articles
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {rest.map((post) => (
              <li key={post.slug}>
                <article className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-soft transition hover:border-blue-200/80 hover:shadow-soft-lg">
                  <time
                    dateTime={post.date}
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {post.date}
                  </time>
                  <h3 className="mt-3 font-display text-lg font-bold leading-snug text-slate-900 transition group-hover:text-blue-800">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-grow text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                  <span className="mt-4 text-sm font-semibold text-blue-700">Coming soon</span>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-4 text-center text-sm text-slate-600">
          For platform certification standards, see{' '}
          <Link to="/compliance" className="font-semibold text-blue-700 underline-offset-2 hover:underline">
            Compliance & certifications
          </Link>
          .
        </div>
      </div>
    </ContentPageShell>
  )
}

export default Blog
