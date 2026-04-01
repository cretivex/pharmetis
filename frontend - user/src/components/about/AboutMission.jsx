import { Globe2, HeartHandshake, ShieldCheck, ClipboardCheck } from 'lucide-react'
import aboutMissionHero from '@reference/assets/images/about-mission-hero.png'

/** Reference layout: icon left, title + short line right; white cards on soft gradient */
const pillars = [
  {
    icon: HeartHandshake,
    title: 'Trusted Partnerships',
    subtitle: 'Audited manufacturers and distributors across key markets.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assurance',
    subtitle: 'Rigorous vetting and documentation you can rely on.',
  },
  {
    icon: ClipboardCheck,
    title: 'Regulatory Compliance',
    subtitle: 'Aligned with WHO-GMP, FDA, and ISO expectations.',
  },
  {
    icon: Globe2,
    title: 'Global Access',
    subtitle: 'Discover and compare suppliers worldwide with clarity.',
  },
]

export default function AboutMission() {
  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      {/* Light purple → blue gradient + subtle decor (reference) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/95 via-sky-50 to-blue-100/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cpath fill='%231e40af' d='M40 200 Q200 80 400 200 T760 200'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(59,130,246,0.12),transparent_50%)]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0c1e3d] md:text-3xl">Our Mission</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-[1.05rem]">
              At Pharmetis, our mission is to revolutionize pharmaceutical supply chains by providing a
              secure platform that connects buyers with certified global manufacturers. We are dedicated
              to ensuring the availability of high-quality, compliant bulk medicines that meet international
              regulatory standards.
            </p>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-blue-400/20 via-violet-300/15 to-transparent blur-xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.2)] ring-1 ring-white/60">
              <img
                src={aboutMissionHero}
                alt="Medical professionals with global healthcare network"
                width={720}
                height={480}
                className="h-auto w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Four white cards: horizontal row, icon left + text right (reference) */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="flex gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_28px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(37,99,235,0.18)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-blue-600 shadow-inner ring-1 ring-blue-200/60">
                <p.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-[#0c1e3d]">{p.title}</p>
                <p className="mt-1 text-xs leading-snug text-slate-600">{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
