import { FileText, ShieldCheck, PackageCheck, BadgeCheck } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Supplier Document Verification',
    description:
      'Business licenses, registrations, and export documentation are reviewed for authenticity and completeness.',
  },
  {
    icon: ShieldCheck,
    title: 'Certification Check (WHO, FDA, ISO)',
    description:
      'Facility and product certifications are cross-checked against recognized standards and regulatory expectations.',
  },
  {
    icon: PackageCheck,
    title: 'Product Quality Review',
    description:
      'Specifications, documentation, and available quality data are evaluated before listings go live.',
  },
  {
    icon: BadgeCheck,
    title: 'Approved & Verified Supplier',
    description:
      'Qualified partners receive a verified badge you can trust when sourcing and negotiating on the platform.',
  },
]

function StepIcon({ icon: Icon, isFinal }) {
  return (
    <div
      className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ring-2 ring-white transition duration-300 group-hover:scale-105 motion-safe:group-hover:shadow-md ${
        isFinal
          ? 'bg-green-50 text-green-600 ring-green-100/90'
          : 'bg-blue-50 text-blue-600 ring-blue-100/90'
      }`}
    >
      <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
    </div>
  )
}

export default function LandingHowWeVerify() {
  return (
    <section
      id="verification"
      className="relative scroll-mt-20 overflow-hidden border-y border-gray-100/80 bg-gray-50 py-12 font-sans md:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:radial-gradient(rgb(148_163_184/0.4)_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
            Trust &amp; safety
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-[1.75rem]">
            How We Verify Suppliers &amp; Products
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            A structured review process so you can source with confidence—from first contact to contract.
          </p>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="relative mt-10 hidden lg:block">
          {/* Progress line: gray → gray → green (last third) */}
          <div
            className="pointer-events-none absolute left-[10%] right-[10%] top-7 z-0 h-1 rounded-full"
            aria-hidden
          >
            <div className="h-full w-full rounded-full bg-gradient-to-r from-gray-200 from-[0%] via-gray-200 via-[62%] to-green-500 to-[100%]" />
          </div>

          <ol className="relative z-[1] grid grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isFinal = i === steps.length - 1
              return (
                <li key={step.title} className="group flex min-w-0 flex-col items-center text-center">
                  <StepIcon icon={Icon} isFinal={isFinal} />
                  <div
                    className={`mt-6 rounded-2xl bg-white/95 px-3 pb-5 pt-1 shadow-sm ring-1 transition duration-300 hover:-translate-y-[4px] hover:shadow-md ${
                      isFinal ? 'ring-green-200/70' : 'ring-gray-200/70'
                    }`}
                  >
                    <h3 className="font-semibold leading-snug text-gray-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="relative mt-10 lg:hidden">
          <div
            className="absolute bottom-10 left-[27px] top-10 w-1 rounded-full bg-gradient-to-b from-gray-200 via-gray-200 to-green-500"
            aria-hidden
          />
          <ol className="relative space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isFinal = i === steps.length - 1
              return (
                <li key={step.title} className="relative flex gap-5">
                  <div className="relative z-10 shrink-0">
                    <StepIcon icon={Icon} isFinal={isFinal} />
                  </div>
                  <div
                    className={`group min-w-0 flex-1 rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 transition duration-300 hover:-translate-y-[4px] hover:shadow-md ${
                      isFinal ? 'ring-green-200/70' : 'ring-gray-200/70'
                    }`}
                  >
                    <h3 className="font-semibold leading-snug text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
