import {
  Pill,
  Activity,
  HeartPulse,
  ThermometerSun,
  Shield,
  Bandage,
  ChevronRight,
} from 'lucide-react'
import { medicineCategories, countryFilters } from '../../data/medicinesCatalog'

const iconMap = {
  pill: Pill,
  activity: Activity,
  'heart-pulse': HeartPulse,
  thermometer: ThermometerSun,
  shield: Shield,
  bandage: Bandage,
}

export default function MedicinesSidebar() {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-1 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.12)] ring-1 ring-white">
        <div className="rounded-[0.875rem] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Refine</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Categories</p>
          <ul className="mt-3 space-y-1">
            {medicineCategories.map((c, i) => {
              const Icon = iconMap[c.icon] ?? Pill
              const active = i === 0
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/20'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-brand'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        active
                          ? 'bg-white text-brand shadow-sm ring-1 ring-brand/15'
                          : 'bg-slate-100 text-brand/80'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="flex-1">{c.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 ${active ? 'text-brand' : 'text-slate-300'}`}
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] ring-1 ring-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Region</p>
        <p className="mt-1 text-xs font-semibold text-slate-700">Country</p>
        <ul className="mt-3 space-y-1">
          {countryFilters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                  c.id === 'all'
                    ? 'bg-gradient-to-r from-brand/12 to-blue-500/10 font-semibold text-brand shadow-sm ring-1 ring-brand/15'
                    : 'text-slate-600 hover:bg-slate-100/90'
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
