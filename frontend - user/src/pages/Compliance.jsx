import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileStack,
  Globe2,
  Mail,
  Microscope,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { FadeIn, MotionSection, Stagger, StaggerItem } from '../components/compliance/ScrollReveal'

const ease = [0.22, 1, 0.36, 1]

const certifications = [
  {
    code: 'WHO-GMP',
    title: 'WHO Good Manufacturing Practice',
    description:
      'Alignment with WHO guidelines for pharmaceutical production, storage, and distribution.',
    accent: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/20',
    featured: true,
  },
  {
    code: 'FDA',
    title: 'FDA standards',
    description:
      'Processes mapped to U.S. FDA expectations for documentation, traceability, and batch records.',
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/20',
  },
  {
    code: 'ISO',
    title: 'ISO quality systems',
    description:
      'ISO-aligned quality management for controlled processes, audits, and continuous improvement.',
    accent: 'from-sky-500 to-blue-600',
    ring: 'ring-sky-500/20',
  },
  {
    code: 'CE',
    title: 'CE marking (where applicable)',
    description:
      'Support for EU regulatory pathways and conformity where products and regions require CE.',
    accent: 'from-teal-500 to-emerald-600',
    ring: 'ring-teal-500/20',
  },
  {
    code: 'GMP',
    title: 'GMP fundamentals',
    description:
      'Core GMP controls across facilities, equipment qualification, validation, and change control.',
    accent: 'from-indigo-500 to-blue-700',
    ring: 'ring-indigo-500/20',
  },
]

const verificationSteps = [
  {
    step: 1,
    title: 'Application & documentation',
    body: 'Suppliers submit licenses, site master files, and product scope for initial screening.',
  },
  {
    step: 2,
    title: 'Credential & reference checks',
    body: 'Regulatory references, audit history, and quality agreements are reviewed by our team.',
  },
  {
    step: 3,
    title: 'Technical assessment',
    body: 'Capability fit, MOQs, cold-chain, and documentation practices are evaluated against platform standards.',
  },
  {
    step: 4,
    title: 'Approval & ongoing monitoring',
    body: 'Verified suppliers receive a trust badge; we monitor renewals, deviations, and buyer feedback.',
  },
]

const regulatoryItems = [
  {
    icon: Scale,
    title: 'Multi-jurisdiction alignment',
    text: 'We map supplier evidence to major regulatory frameworks so buyers can compare apples to apples.',
  },
  {
    icon: Globe2,
    title: 'Import & export awareness',
    text: 'Country-specific requirements are surfaced early—reducing surprises after the RFQ.',
  },
  {
    icon: Shield,
    title: 'Data integrity & access',
    text: 'Role-based access, audit logs, and secure document exchange for sensitive compliance files.',
  },
]

const qaPillars = [
  {
    icon: Microscope,
    title: 'Release & specifications',
    text: 'COA templates, specification management, and batch traceability expectations are standardized.',
  },
  {
    icon: ClipboardCheck,
    title: 'Audits & CAPA',
    text: 'We track audit outcomes and corrective actions as part of supplier health on the platform.',
  },
  {
    icon: Users,
    title: 'Training & ownership',
    text: 'Clear ownership for quality roles—so RFQs and disputes route to accountable contacts.',
  },
]

const documentsProvided = [
  'GMP / GDP certificates and manufacturing authorizations (as applicable)',
  'Site master file excerpts and key facility registrations',
  'Product regulatory dossier pointers (DMF / CEP references where shared)',
  'Certificates of analysis (COA) and stability summaries (as offered by supplier)',
  'Audit reports, CAPA summaries, and quality agreements (under NDA where required)',
  'Cold chain & logistics validation evidence for temperature-sensitive lines',
]

function ScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setP(max > 0 ? el.scrollTop / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-14 z-30 h-[2px] bg-slate-200/30"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 transition-[width] duration-150 ease-out"
        style={{ width: `${Math.min(100, p * 100)}%` }}
      />
    </div>
  )
}

export default function Compliance() {
  const reduce = useReducedMotion()

  useEffect(() => {
    document.title = 'Compliance & Certifications | Pharmetis'
  }, [])

  return (
    <div id="compliance" className="relative min-h-screen bg-[#f1f4f8] text-slate-900 antialiased">
      <ScrollProgress />

      {/* —— Hero —— */}
      <section className="relative min-h-0 overflow-hidden border-b border-white/10 bg-[#030712]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(59,130,246,0.08)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_0%,rgba(59,130,246,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_100%,rgba(16,185,129,0.22),transparent_50%)]" />

        {!reduce && (
          <>
            <motion.div
              className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-500/25 blur-[100px]"
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[110px]"
              animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-300/95 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
              Trust & regulatory
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
              <span className="bg-gradient-to-r from-white via-blue-100 to-emerald-200/90 bg-clip-text text-transparent">
                Compliance
              </span>{' '}
              <span className="text-white/95">&amp; Certifications</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              A transparent framework for how Pharmetis evaluates suppliers, surfaces documentation, and
              helps procurement teams buy with confidence—without replacing your own regulatory sign-off.
            </p>
            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3"
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <a
                href="#frameworks"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-blue-900/40 transition hover:bg-emerald-50"
              >
                Explore frameworks
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
                Audit-ready by design
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f1f4f8] to-transparent" />
      </section>

      {/* —— Certifications (bento-inspired) —— */}
      <MotionSection id="frameworks" className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-blue-600/90">
            Frameworks
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl md:leading-snug">
            Certifications buyers recognize
          </h2>
          <p className="mt-2 text-pretty text-sm text-slate-600 md:text-base">
            Globally referenced standards—surfaced clearly so you can compare supplier posture at a glance.
          </p>
        </FadeIn>

        <Stagger className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-12 lg:gap-4" stagger={0.09}>
          {certifications.map((c) => (
            <StaggerItem
              key={c.code}
              className={
                c.featured
                  ? 'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-md lg:col-span-6'
                  : 'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] transition duration-300 hover:shadow-md lg:col-span-3'
              }
            >
              <div
                className={`inline-flex w-fit items-center rounded-lg bg-gradient-to-r px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-white shadow-sm ${c.accent}`}
              >
                {c.code}
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-950">{c.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-snug text-slate-600">{c.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-emerald-700/90">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 ${c.ring} ring-1`}>
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                </span>
                Referenced in supplier profiles
              </div>
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition group-hover:opacity-70 ${c.accent}`}
                aria-hidden
              />
            </StaggerItem>
          ))}
        </Stagger>
      </MotionSection>

      {/* —— Verification timeline —— */}
      <MotionSection className="relative border-y border-slate-200/80 bg-white py-10 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0)_0%,rgba(241,245,249,0.5)_50%,rgba(248,250,252,0)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-600/90">
              Process
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Supplier verification
            </h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              A structured path before a supplier appears as verified on Pharmetis.
            </p>
          </FadeIn>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <motion.div
              className="absolute left-[0.875rem] top-0 bottom-0 w-0.5 origin-top rounded-full bg-gradient-to-b from-blue-500 via-cyan-400 to-emerald-500"
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={reduce ? undefined : { scaleY: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduce ? 0 : 1.1, ease }}
              style={{ transformOrigin: 'top' }}
              aria-hidden
            />
            <ol className="relative space-y-5">
              {verificationSteps.map((s, i) => (
                <motion.li
                  key={s.step}
                  className="relative flex gap-3 pl-10"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.06, ease }}
                >
                  <span className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-white/80 bg-gradient-to-br from-blue-600 to-emerald-600 text-xs font-bold text-white shadow-md">
                    {s.step}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:ring-blue-500/15">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Step {s.step}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-snug text-slate-600">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </MotionSection>

      {/* —— Regulatory —— */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-blue-600/90">
            Governance
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Regulatory compliance
          </h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Guardrails for cross-border pharma trade and sensitive documentation.
          </p>
        </FadeIn>

        <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {regulatoryItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08, ease }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-emerald-500/[0.04] opacity-0 transition group-hover:opacity-100" />
              <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-500/20">
                <item.icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="relative mt-3 text-base font-semibold text-slate-950">{item.title}</h3>
              <p className="relative mt-1.5 text-sm leading-snug text-slate-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </MotionSection>

      {/* —— Quality assurance —— */}
      <MotionSection className="relative overflow-hidden border-y border-emerald-200/30 bg-gradient-to-br from-emerald-50/70 via-white to-cyan-50/40 py-10 md:py-12">
        <div className="pointer-events-none absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-emerald-400/12 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-700/90">
              Quality
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Quality assurance
            </h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Specification discipline and accountability across the network.
            </p>
          </FadeIn>

          <Stagger className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4" stagger={0.1}>
            {qaPillars.map((q) => (
              <StaggerItem
                key={q.title}
                className="rounded-2xl border border-emerald-200/50 bg-white/95 p-5 shadow-sm ring-1 ring-emerald-500/10 transition hover:shadow-md"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80">
                  <q.icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-950">{q.title}</h3>
                <p className="mt-1.5 text-sm leading-snug text-slate-600">{q.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </MotionSection>

      {/* —— Documents —— */}
      <MotionSection className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <FadeIn>
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md ring-1 ring-slate-900/[0.04]">
            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-950 to-emerald-950 px-5 py-6 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_100%_0%,rgba(52,211,153,0.25),transparent_50%)]" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                    <FileStack className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">
                      Documents often provided
                    </h2>
                    <p className="mt-0.5 max-w-xl text-xs text-slate-300 sm:text-sm">
                      Typical artifacts suppliers may attach or share under NDA—subject to scope and region.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {documentsProvided.map((line, i) => (
                <motion.li
                  key={line}
                  initial={reduce ? false : { opacity: 0, x: -16 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.04, ease }}
                  className="flex gap-3 px-4 py-3 text-sm leading-snug text-slate-700 sm:px-5"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>{line}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </MotionSection>

      {/* —— CTA —— */}
      <MotionSection className="bg-[#f1f4f8] pb-10 pt-2 md:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 p-6 shadow-lg sm:p-7 md:p-8"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease }}
          >
            <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-blue-500/25 blur-[70px]" aria-hidden />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-[60px]" aria-hidden />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-emerald-200/95">
                  <Building2 className="h-3 w-3" aria-hidden />
                  Compliance desk
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl">
                  Contact the compliance team
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Questions about supplier evidence, audits, or documentation—we route you to the right
                  specialist.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                <motion.a
                  href="mailto:compliance@pharmetis.com"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-emerald-50"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  compliance@pharmetis.com
                </motion.a>
                <Link
                  to="/about#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Open contact form
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </MotionSection>
    </div>
  )
}
