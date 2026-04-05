import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import { ArrowRight, Sparkles } from 'lucide-react'

/**
 * Marketing / SEO content layout — dark editorial hero + elevated content card.
 * Navbar and Footer come from MainLayout.
 */
function ContentPageShell({
  eyebrow = 'Resources',
  title,
  subtitle,
  children,
  className = '',
}) {
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 antialiased ${className}`}>
      {/* Hero — depth, mesh, ambient orbs */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#050b1d] via-[#0a1628] to-[#0f172a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-blue-500/25 blur-3xl animate-glow-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />

        <Container>
          <div className="relative py-14 sm:py-16 md:py-20 lg:py-24">
            {eyebrow ? (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300/90" aria-hidden />
                {eyebrow}
              </div>
            ) : null}
            <h1 className="max-w-4xl font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
                {subtitle}
              </p>
            ) : null}
          </div>
        </Container>
      </header>

      {/* Elevated content panel */}
      <div className="relative z-[1] -mt-8 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="container-custom">
          <article className="animate-fade-up rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-soft-xl ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-8 md:p-10 lg:p-12 xl:p-14">
            {children}
          </article>
        </div>
      </div>

      {/* CTA strip */}
      <div className="relative border-t border-slate-200/80 bg-gradient-to-br from-slate-900 via-[#0c1424] to-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(59,130,246,0.12),transparent)]"
          aria-hidden
        />
        <Container>
          <div className="relative flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight md:text-xl">
                Source from verified suppliers worldwide
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-400">
                Browse the catalog or create a buyer account to send RFQs and compare quotations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/medicines"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:bg-slate-100"
              >
                Browse medicines
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Create buyer account
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default ContentPageShell
