import { useState } from 'react'
import {
  Award,
  ChevronDown,
  Clock,
  Headphones,
  Mail,
  Phone,
  Shield,
  Check,
} from 'lucide-react'

const subjects = [
  'General inquiry',
  'Bulk RFQ',
  'Supplier onboarding',
  'Compliance & documentation',
  'Partnership',
]

const trustBadges = ['WHO-GMP Certified', 'ISO Certified', 'FDA Approved']

const featureCards = [
  {
    icon: Headphones,
    title: 'Information',
    body: 'Guidance on sourcing, RFQs, and onboarding.',
  },
  {
    icon: Clock,
    title: 'Office Hours',
    body: 'Live chat available during business hours.',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    body: 'Encrypted sessions and role-based access for your team.',
  },
  {
    icon: Award,
    title: 'ISO Certified',
    body: 'Processes aligned with international quality standards.',
  },
]

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10'

export default function AboutContact() {
  const [subject, setSubject] = useState(subjects[0])

  return (
    <section id="contact" className="scroll-mt-20 bg-zinc-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 md:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">
            Get in Touch with Us
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-snug text-zinc-600 md:text-base">
            Tell us what you need — our team will respond with next steps.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <form
            className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-950/[0.04] md:p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-3">
              <div>
                <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-zinc-800">
                  Name
                </label>
                <input
                  id="contact-name"
                  className={inputClass}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-zinc-800">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className={inputClass}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold text-zinc-800">
                  Subject Matter
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold text-zinc-800">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  className={`${inputClass} resize-y`}
                  placeholder="How can we help?"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:ring-offset-2"
            >
              Send Message
            </button>
          </form>

          <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm ring-1 ring-zinc-950/[0.04] md:p-5">
              <div className="divide-y divide-zinc-100">
                <a
                  href="tel:+18005551234"
                  className="flex items-center gap-3 py-2.5 text-zinc-800 transition first:pt-0 last:pb-0 hover:text-zinc-950"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Phone
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-900">+1 (800) 555-1234</span>
                  </span>
                </a>
                <a
                  href="mailto:support@pharmetis.com"
                  className="flex items-center gap-3 py-2.5 text-zinc-800 transition hover:text-zinc-950"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Email
                    </span>
                    <span className="break-all font-semibold text-zinc-900">support@pharmetis.com</span>
                  </span>
                </a>
                <div className="flex items-start gap-3 py-2.5 text-zinc-800">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
                    <Clock className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Operating hours
                    </span>
                    <span className="font-semibold text-zinc-900">Mon–Fri · 9:00–18:00 IST</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featureCards.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex h-full flex-col rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm ring-1 ring-zinc-950/[0.03]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-900">{title}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-snug text-zinc-600">{body}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 shadow-sm">
              {trustBadges.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 sm:text-xs"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2.5} aria-hidden />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
