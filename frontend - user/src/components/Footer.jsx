import { Link } from 'react-router-dom'
import Container from './ui/Container'

function Footer() {
  const currentYear = new Date().getFullYear()

  const platformLinks = [
    { path: '/medicines', label: 'Medicines' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/compliance', label: 'Compliance' },
    { path: '/about', label: 'About Us' },
    { path: '/platform', label: 'Platform' },
  ]

  const connectLinks = [
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
  ]

  const legalLinks = [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/compliance', label: 'Compliance Policy' },
  ]

  return (
    <footer id="footer" className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 md:py-14 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center">
              <img
                src="/logo-pharmetis.svg"
                alt="Pharmetis"
                className="h-12 w-auto max-w-[280px] object-contain object-left sm:h-14"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              © {currentYear} Pharmetis. All rights reserved.
            </p>
            <p className="mt-4 text-sm">
              <a
                href="mailto:contact@pharmetis.com"
                className="text-slate-300 transition-colors hover:text-white"
              >
                contact@pharmetis.com
              </a>
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Connect</h4>
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300">
                      {link.label === 'LinkedIn' && 'in'}
                      {link.label === 'Twitter' && 'X'}
                      {link.label === 'YouTube' && '▶'}
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {['WHO-GMP', 'FDA', 'ISO'].map((b) => (
                <span
                  key={b}
                  className="rounded border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 py-6 md:flex-row">
          <p className="text-xs text-slate-500">© {currentYear} Pharmetis. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link to="/privacy" className="text-slate-500 transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="text-slate-500 transition-colors hover:text-white">
              Terms
            </Link>
            <Link to="/compliance" className="text-slate-500 transition-colors hover:text-white">
              Compliance
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
