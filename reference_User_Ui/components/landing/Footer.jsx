import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const platform = [
  { label: 'Browse Medicines', to: '/medicines' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Compliance', to: { pathname: '/', hash: 'compliance' } },
  { label: 'About Us', to: '/about' },
]

const legal = [
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Cookie Policy', href: '#' },
]

const connect = [
  { label: 'Contact', href: 'mailto:support@pharmetis.com' },
  { label: 'LinkedIn', href: '#' },
]

export default function Footer() {
  return (
    <footer
      id="footer"
      className="relative scroll-mt-24 border-t border-white/5 bg-slate-950 text-slate-400"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-xl font-bold text-transparent">
              pharmetis
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              B2B marketplace for bulk pharmaceutical sourcing from verified global manufacturers.
            </p>
            <a
              href="mailto:support@pharmetis.com"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-2 text-sm font-medium text-white transition hover:border-brand/50 hover:text-brand"
            >
              <Mail className="h-4 w-4" aria-hidden />
              support@pharmetis.com
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Platform</p>
            <ul className="mt-5 space-y-3">
              {platform.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Legal</p>
            <ul className="mt-5 space-y-3">
              {legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Connect</p>
            <ul className="mt-5 space-y-3">
              {connect.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-slate-400 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              {['WHO-GMP', 'FDA', 'ISO'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-slate-700/80 bg-slate-900/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Pharmetis. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
