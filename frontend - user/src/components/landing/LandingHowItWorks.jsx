import { Fragment } from 'react'

function IllustrationSearch() {
  return (
    <svg viewBox="0 0 280 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="hiw-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <linearGradient id="hiw-g2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="280" height="160" rx="16" fill="url(#hiw-g1)" />
      <circle cx="120" cy="78" r="42" fill="white" opacity="0.95" />
      <circle cx="120" cy="78" r="28" fill="none" stroke="url(#hiw-g2)" strokeWidth="6" />
      <path d="M148 106l28 28" stroke="url(#hiw-g2)" strokeWidth="6" strokeLinecap="round" />
      <rect x="52" y="118" width="176" height="10" rx="5" fill="#c7d2fe" opacity="0.8" />
      <rect x="72" y="132" width="96" height="8" rx="4" fill="#a5b4fc" opacity="0.5" />
    </svg>
  )
}

function IllustrationRfq() {
  return (
    <svg viewBox="0 0 280 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="hiw-r1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <linearGradient id="hiw-r2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="280" height="160" rx="16" fill="url(#hiw-r1)" />
      <rect x="56" y="36" width="168" height="108" rx="12" fill="white" opacity="0.95" />
      <rect x="72" y="56" width="120" height="8" rx="4" fill="#e2e8f0" />
      <rect x="72" y="74" width="96" height="8" rx="4" fill="#e2e8f0" />
      <rect x="72" y="92" width="136" height="8" rx="4" fill="#e2e8f0" />
      <path d="M56 132l40-24h88l40 24" fill="url(#hiw-r2)" opacity="0.9" />
      <circle cx="196" cy="52" r="18" fill="#3b82f6" opacity="0.9" />
      <path d="M190 52l6 6 12-12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function IllustrationVerify() {
  return (
    <svg viewBox="0 0 280 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="hiw-v1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <rect width="280" height="160" rx="16" fill="url(#hiw-v1)" />
      <path
        d="M140 28l52 26v40c0 36-52 58-52 58s-52-22-52-58V54l52-26z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M140 44l40 20v34c0 28-40 46-40 46s-40-18-40-46V64l40-20z"
        fill="#10b981"
        opacity="0.15"
      />
      <path
        d="M124 88l16 16 32-36"
        stroke="#059669"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="64" y="124" width="152" height="8" rx="4" fill="#a7f3d0" opacity="0.6" />
    </svg>
  )
}

function IllustrationDeal() {
  return (
    <svg viewBox="0 0 280 160" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="hiw-d1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="hiw-d2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="280" height="160" rx="16" fill="url(#hiw-d1)" />
      <rect x="48" y="88" width="184" height="48" rx="10" fill="white" opacity="0.95" />
      <circle cx="100" cy="64" r="22" fill="url(#hiw-d2)" opacity="0.85" />
      <circle cx="180" cy="64" r="22" fill="#3b82f6" opacity="0.85" />
      <path
        d="M108 72h64M124 60l-8 12 8 12M156 60l8 12-8 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="72" y="102" width="136" height="8" rx="4" fill="#e2e8f0" />
      <rect x="88" y="116" width="104" height="6" rx="3" fill="#cbd5e1" />
      <path d="M32 124h24l-6 20H38z" fill="#94a3b8" opacity="0.4" />
      <path d="M224 124h24l6 20h-12z" fill="#94a3b8" opacity="0.4" />
    </svg>
  )
}

const steps = [
  {
    illustration: IllustrationSearch,
    title: 'Search & Shortlist Products',
    body: 'Filter by certification, dosage, MOQ, and region—build a qualified shortlist in minutes.',
  },
  {
    illustration: IllustrationRfq,
    title: 'Send RFQ / Inquiry',
    body: 'Submit structured RFQs with quantities and timelines; suppliers respond through the platform.',
  },
  {
    illustration: IllustrationVerify,
    title: 'Supplier Verification',
    body: 'Licenses, certifications, and quality signals are reviewed so you engage verified partners.',
  },
  {
    illustration: IllustrationDeal,
    title: 'Connect & Deal / Delivery',
    body: 'Align on terms, logistics, and documentation—then move from handshake to compliant delivery.',
  },
]

function ConnectorHorizontal() {
  return (
    <div className="hidden w-4 shrink-0 items-center justify-center lg:flex" aria-hidden>
      <div className="flex w-full items-center">
        <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-300" />
        <svg width="18" height="18" viewBox="0 0 24 24" className="-ml-px shrink-0 text-slate-400">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

function ConnectorVertical() {
  return (
    <div className="flex justify-center py-1 lg:hidden" aria-hidden>
      <div className="flex flex-col items-center">
        <div className="h-5 w-px bg-gradient-to-b from-slate-200 to-slate-300" />
        <svg width="20" height="20" viewBox="0 0 24 24" className="text-slate-400">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default function LandingHowItWorks() {
  return (
    <section className="relative overflow-hidden bg-slate-50/90 py-10 backdrop-blur-[2px] md:py-14">
      <div className="pattern-dots pointer-events-none absolute inset-0 opacity-[0.28]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">Process</p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.6rem] md:text-[1.75rem]">
            How It Works
          </h2>
          <p className="mt-2 text-sm leading-snug text-slate-600 sm:text-[0.95rem]">
            From search to signed orders—clear steps for global B2B pharmaceutical sourcing.
          </p>
        </div>

        <div className="mt-10 flex flex-col lg:mt-12 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map((step, i) => {
            const Illustration = step.illustration
            const altBg = i % 2 === 1
            return (
              <Fragment key={step.title}>
                {i > 0 ? (
                  <>
                    <ConnectorVertical />
                    <ConnectorHorizontal />
                  </>
                ) : null}
                <article
                  className={[
                    'group flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border text-center shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] transition duration-300',
                    'hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)]',
                    altBg
                      ? 'border-slate-200/80 bg-slate-100/80'
                      : 'border-slate-200/70 bg-white',
                  ].join(' ')}
                >
                  <div className="relative aspect-[7/4] w-full overflow-hidden border-b border-slate-200/60 bg-slate-50/50">
                    <div className="absolute inset-0 p-3 transition duration-300 group-hover:scale-[1.02]">
                      <Illustration />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-4 pb-5 pt-4 sm:px-5">
                    <span className="mx-auto inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                      {step.title}
                    </h3>
                    <p className="mt-2 flex-1 text-left text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                      {step.body}
                    </p>
                  </div>
                </article>
              </Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
