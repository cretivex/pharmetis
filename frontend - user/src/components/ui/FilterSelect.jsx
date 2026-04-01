import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const triggerDefault =
  'flex w-full min-h-[2.75rem] cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

const triggerPill =
  'inline-flex h-9 max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-white pl-2 pr-2 text-sm font-medium text-[#3b4ed0] shadow-sm transition hover:border-blue-300 hover:bg-blue-50/90 focus:outline-none focus:ring-2 focus:ring-[#3b4ed0]/25'

const listBase =
  'absolute top-[calc(100%+6px)] z-[100] max-h-56 min-w-[12rem] max-w-[min(calc(100vw-2rem),18rem)] overflow-y-auto rounded-xl border border-gray-200/90 bg-white py-1 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5'

const optionClass =
  'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-gray-900 transition hover:bg-slate-50 active:bg-slate-100'

/** Custom listbox dropdown (native select menus cannot be styled on Windows). */
export default function FilterSelect({
  id: idProp,
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  variant = 'default',
  icon = null,
  alignMenu = 'start',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const autoId = useId()
  const listboxId = `${autoId}-listbox`
  const buttonId = idProp || `${autoId}-btn`

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const selected = options.find((o) => o.value === value) ?? options[0]

  const menuPosition =
    alignMenu === 'end' ? 'right-0 left-auto' : 'left-0 right-auto'

  const triggerClass = variant === 'pill' ? triggerPill : triggerDefault

  return (
    <div ref={rootRef} className={`relative ${variant === 'pill' ? 'inline-flex' : 'block w-full'}`}>
      <button
        type="button"
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={triggerClass}
        onClick={() => setOpen((o) => !o)}
      >
        {variant === 'pill' && icon ? (
          <span className="flex shrink-0 text-[#3b4ed0]" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label ?? ''}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#3b4ed0]/80 transition sm:h-4 sm:w-4 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className={`${listBase} ${menuPosition}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={String(opt.value)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${optionClass} ${isSelected ? 'bg-blue-50/80 text-blue-900' : ''}`}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1">{opt.label}</span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
