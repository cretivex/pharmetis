import { ArrowRight, Pill } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'

const links = [
  { label: 'Medicines', to: '/medicines' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Compliance', to: { pathname: '/', hash: 'compliance' } },
  { label: 'About Us', to: '/about' },
]

function linkKey(to) {
  return typeof to === 'string' ? to : `${to.pathname}${to.hash ?? ''}`
}

export default function Navbar() {
  const { pathname } = useLocation()

  const isActive = (to) => {
    if (typeof to === 'string') {
      return pathname === to
    }
    return false
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.12] bg-slate-950/35 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-slate-950/25">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        {/* Logo — left */}
        <Link
          to="/"
          className="relative z-10 flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-white"
        >
          <span className="lowercase">pharmetis</span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c1a33] ring-1 ring-white/10"
            aria-hidden
          >
            <Pill className="h-4 w-4 text-sky-400" strokeWidth={2} />
          </span>
        </Link>

        {/* Nav — centered on the row */}
        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:items-center md:gap-8"
          aria-label="Primary"
        >
          {links.map((l) => {
            const active = isActive(l.to)
            return (
              <Link
                key={linkKey(l.to)}
                to={l.to}
                className={`text-sm font-medium text-white transition hover:opacity-90 ${
                  active ? 'opacity-100' : 'opacity-95'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions — right */}
        <div className="relative z-10 flex shrink-0 items-center gap-4">
          <Button variant="headerOutline" size="nav" to={{ pathname: '/', hash: 'footer' }} className="inline-flex">
            Login
          </Button>
          <Button variant="headerPrimary" size="nav" to="/medicines" className="inline-flex">
            Send RFQ
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  )
}
