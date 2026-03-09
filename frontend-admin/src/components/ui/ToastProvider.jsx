import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const TOAST_TTL = 5000
const MAX_VISIBLE = 5

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-primary/30 bg-primary/10 text-primary',
}

function Toast({ id, type, message, dismiss }) {
  const Icon = icons[type]
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(dismiss, 200)
    }, TOAST_TTL)
    return () => clearTimeout(t)
  }, [dismiss])

  if (!visible) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 shadow-lg transition-opacity',
        styles[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1 text-foreground">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => { setVisible(false); setTimeout(dismiss, 200) }}
        className="shrink-0 rounded p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, type, message }])
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    {
      success: (msg) => add('success', msg),
      error: (msg) => add('error', msg),
      warning: (msg) => add('warning', msg),
      info: (msg) => add('info', msg),
    },
    [add]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              id={t.id}
              type={t.type}
              message={t.message}
              dismiss={() => dismiss(t.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
