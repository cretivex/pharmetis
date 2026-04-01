import { useState } from 'react'
import { ChevronDown, Clock, Headphones, Mail, Phone, Shield, Globe2, Check } from 'lucide-react'

const subjects = [
  'General inquiry',
  'Bulk RFQ',
  'Supplier onboarding',
  'Compliance & documentation',
  'Partnership',
]

const trustBadges = ['WHO-GMP', 'ISO', 'FDA Approved', 'Verified Suppliers']

export default function AboutContact() {
  const [subject, setSubject] = useState(subjects[0])

  return (
    <section id="contact" className="scroll-mt-24 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Get in Touch with Us
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Tell us what you need — our team will respond with next steps.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <form
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-white md:p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-800">
                  Name
                </label>
                <input
                  id="contact-name"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-800">
                  Subject Matter
                </label>
                <div className="relative mt-1.5">
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-800">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="How can we help?"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover"
            >
              Send Message
            </button>
          </form>

          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200/80">
              <img
                src="/images/about-team-professional.png"
                alt="Customer support representative"
                width={720}
                height={420}
                className="h-48 w-full object-cover object-[center_15%] sm:h-56"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-semibold">We’re here to help</p>
                <p className="text-xs text-white/80">Avg. response 5–24h on business days</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <a
                href="tel:+18005551234"
                className="flex items-center gap-3 text-slate-800 transition hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </span>
                  <span className="font-medium">+1 (800) 555-1234</span>
                </span>
              </a>
              <a
                href="mailto:support@pharmetis.com"
                className="flex items-center gap-3 text-slate-800 transition hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </span>
                  <span className="font-medium">support@pharmetis.com</span>
                </span>
              </a>
              <div className="flex items-start gap-3 text-slate-800">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hours
                  </span>
                  <span className="font-medium">Mon–Fri · 9:00–18:00 IST</span>
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-brand">
                  <Headphones className="h-4 w-4" aria-hidden />
                  <span className="text-xs font-bold uppercase tracking-wide">Information</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Guidance on sourcing, RFQs, and onboarding.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-brand">
                  <Clock className="h-4 w-4" aria-hidden />
                  <span className="text-xs font-bold uppercase tracking-wide">Office Hours</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Live chat available during business hours.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Shield className="h-4 w-4 text-brand" aria-hidden />
                Secure Platform
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Globe2 className="h-4 w-4 text-brand" aria-hidden />
                ISO Certified
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {trustBadges.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
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
