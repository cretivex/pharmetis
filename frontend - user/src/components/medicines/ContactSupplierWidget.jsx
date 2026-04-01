import { ChevronDown, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const departments = ['Sales — bulk@pharmetis.com', 'Compliance — qa@pharmetis.com', 'Partnerships']

export default function ContactSupplierWidget() {
  const navigate = useNavigate()

  return (
    <div className="pointer-events-auto relative w-full max-w-[17.5rem] overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-b from-white to-slate-50 p-5 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/90">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-bold text-white shadow-lg shadow-black/25 ring-2 ring-white">
            PM
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
              title="Available"
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-900">Pharmetis Concierge</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Avg. reply 5–24h · Priority routing</p>
          </div>
        </div>
        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Department
        </label>
        <div className="relative mt-1.5">
          <select
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            defaultValue={departments[0]}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={() => navigate('/send-rfq')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-lg shadow-black/25 transition hover:bg-neutral-800"
        >
          <Send className="h-4 w-4" aria-hidden />
          Send Inquiry
        </button>
      </div>
    </div>
  )
}
