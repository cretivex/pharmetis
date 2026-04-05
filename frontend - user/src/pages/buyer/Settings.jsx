import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Moon, Sun, Trash2, Save, Loader2, ExternalLink } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { settingsService } from '../../services/settings.service.js'

const defaultNotifications = {
  email: true,
  rfqResponses: true,
  orderUpdates: true,
  marketing: false,
  paymentAlerts: true,
}

function BuyerSettings() {
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState(defaultNotifications)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await settingsService.getSettings()
        const n = data?.notifications || {}
        if (!cancelled) {
          setNotifications({
            email: n.email !== false,
            rfqResponses: n.rfqResponses !== false,
            orderUpdates: n.orderUpdates !== false,
            marketing: !!n.marketing,
            paymentAlerts: n.paymentAlerts !== false,
          })
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaved(false)
      await settingsService.updateSettings({
        notifications: {
          email: notifications.email,
          rfqResponses: notifications.rfqResponses,
          orderUpdates: notifications.orderUpdates,
          marketing: notifications.marketing,
          paymentAlerts: notifications.paymentAlerts,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account preferences</p>
        <p className="mt-2 text-sm text-slate-500">
          For profile, company, addresses, and security, use{' '}
          <Link to="/settings" className="font-medium text-blue-600 hover:text-blue-700">
            full account settings
          </Link>
          .
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Settings saved.
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Bell className="h-5 w-5" />
          Notification preferences
        </h2>
        <div className="space-y-4">
          {[
            { key: 'email', title: 'Email alerts', desc: 'Receive email notifications' },
            { key: 'rfqResponses', title: 'RFQ updates', desc: 'Get notified about RFQ responses' },
            { key: 'orderUpdates', title: 'Order updates', desc: 'Track order status changes' },
            { key: 'paymentAlerts', title: 'Payment alerts', desc: 'Payment status notifications' },
            { key: 'marketing', title: 'Marketing', desc: 'Product news and tips (optional)' },
          ].map(({ key, title, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-900">{title}</p>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={!!notifications[key]}
                  onChange={() => toggle(key)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
          {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
          <div>
            <p className="font-medium text-slate-900">Theme</p>
            <p className="text-sm text-slate-600">Toggle dark / light (stored locally)</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 transition-colors hover:bg-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-600">
          <Trash2 className="h-5 w-5" />
          Danger zone
        </h2>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="mb-4 text-sm text-red-700">
            Account deletion must be requested through support to ensure data compliance.
          </p>
          <a
            href="mailto:support@pharmetis.com"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
          >
            Contact support
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Full account settings
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2 font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </div>
    </div>
  )
}

export default BuyerSettings
