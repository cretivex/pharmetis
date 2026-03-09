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
    <footer className="bg-white border-t border-blue-200 text-slate-700">
      <Container>
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Branding Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img
                src="/logo.svg"
                alt="Pharmetis"
                className="h-[4.75rem] w-auto object-contain"
              />
              <div className="w-12 h-1 bg-blue-600 mt-2"></div>
            </div>
            <p className="text-sm text-slate-600 mt-8 leading-relaxed">
              © {currentYear} Pharmetis. All rights reserved.
            </p>
            <p className="text-sm text-slate-600 mt-4">
              <a href="mailto:contact@pharmetis.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                contact@pharmetis.com
              </a>
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-base font-semibold text-slate-900 mb-4">Connect</h4>
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                      {link.label === 'LinkedIn' && 'in'}
                      {link.label === 'Twitter' && 'X'}
                      {link.label === 'YouTube' && '▶'}
                    </span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Pharmetis. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link to="/compliance" className="hover:text-blue-600 transition-colors">Compliance</Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
