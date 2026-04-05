import { Quote } from 'lucide-react'

const items = [
  {
    quote:
      'Pharmetis shortened our sourcing cycle for oncology lines. RFQs were clear and supplier responses came through one workspace.',
    name: 'Director of Procurement',
    org: 'Regional hospital network · EU',
  },
  {
    quote:
      'We needed WHO-GMP documentation packaged for import. The platform kept quotations and compliance context in one place.',
    name: 'Head of Supply Chain',
    org: 'Specialty distributor · Middle East',
  },
  {
    quote:
      'As a manufacturer, assigned RFQs are structured and the response flow is straightforward compared to email-only procurement.',
    name: 'Export Manager',
    org: 'API & finished dose manufacturer · India',
  },
]

export default function AboutTestimonials() {
  return (
    <section className="border-y border-slate-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          What teams say
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Case studies with named customers can be added as you onboard reference buyers and suppliers.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-blue-600/40" aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{t.quote}</blockquote>
              <figcaption className="mt-4 border-t border-slate-200 pt-4 text-sm">
                <span className="font-semibold text-slate-900">{t.name}</span>
                <span className="mt-0.5 block text-slate-500">{t.org}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
