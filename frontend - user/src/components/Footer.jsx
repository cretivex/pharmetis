import { Link } from 'react-router-dom'
import Container from './ui/Container'

function Footer() {
  const currentYear = new Date().getFullYear()

  const platformLinks = [
    { path: '/medicines', label: 'Medicines' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/compliance', label: 'Compliance' },
    { path: '/platform', label: 'Platform' },
    { path: '/about', label: 'About Us' },
  ]

  const resourceLinks = [
    { path: '/resources', label: 'All resources' },
    { path: '/blog', label: 'Blog' },
    { path: '/industry-news', label: 'Industry news' },
    { path: '/guides/import-export', label: 'Import & export guides' },
    { path: '/guides/compliance-guides', label: 'Compliance guides' },
    { path: '/guides/market-reports', label: 'Market reports' },
  ]

  const legalLinks = [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/compliance', label: 'Compliance' },
  ]

  const trustBadges = ['WHO-GMP', 'FDA', 'ISO']

  return (
    <footer id="footer" className="border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-950 text-slate-400">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="mb-5 inline-block">
              <img
                src="/logo-pharmetis.svg"
                alt="Pharmetis"
                className="h-11 w-auto max-w-[260px] object-contain object-left sm:h-12"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Verified pharmaceutical sourcing, RFQs, and compliance-focused trade execution.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a
                href="mailto:contact@pharmetis.com"
                className="block text-slate-300 transition-colors hover:text-white"
              >
                contact@pharmetis.com
              </a>
              <a
                href="mailto:support@pharmetis.com"
                className="block text-slate-300 transition-colors hover:text-white"
              >
                support@pharmetis.com
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Standards">
              {trustBadges.map((b) => (
                <span
                  key={b}
                  className="rounded-md border border-slate-700/80 bg-slate-900/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Learn
            </h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 py-6 sm:flex-row sm:py-7">
          <p className="text-center text-xs text-slate-600 sm:text-left">
            © {currentYear} Pharmetis. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" aria-label="Legal">
            <Link to="/privacy" className="text-slate-500 transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="text-slate-500 transition-colors hover:text-white">
              Terms
            </Link>
            <Link to="/compliance" className="text-slate-500 transition-colors hover:text-white">
              Compliance
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
