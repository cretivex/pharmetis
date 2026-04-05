import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { User, Save, Loader2, FileText, ArrowRight } from 'lucide-react'
import { rfqService } from '../../services/rfq.service'
import { settingsService } from '../../services/settings.service'
import { authService } from '../../services/auth.service'
import { transformRFQ } from '../../utils/dataTransform'
import { setUser } from '../../store/authSlice'

function Profile() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    phone: '',
    city: '',
    country: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [rfqs, setRfqs] = useState([])
  const [rfqsLoading, setRfqsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const profileData = await settingsService.getProfile()
        if (cancelled) return
        setFormData({
          email: profileData.email || '',
          fullName: profileData.fullName || '',
          companyName: profileData.companyName || '',
          phone: profileData.phone || '',
          city: profileData.city || '',
          country: profileData.country || '',
        })
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadRFQs() {
      try {
        const result = await rfqService.getAll({ page: 1, limit: 5 })
        const list = Array.isArray(result) ? result : []
        if (!cancelled) setRfqs(list.map(transformRFQ))
      } catch {
        if (!cancelled) setRfqs([])
      } finally {
        if (!cancelled) setRfqsLoading(false)
      }
    }
    loadRFQs()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)
    try {
      const updated = await settingsService.updateProfile({
        fullName: formData.fullName?.trim() || undefined,
        companyName: formData.companyName?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        country: formData.country?.trim() || undefined,
      })
      const prev = authService.getCurrentUser()
      const userPayload = {
        ...updated,
        id: updated.id || prev?.id,
        email: updated.email ?? formData.email,
        fullName: updated.fullName ?? formData.fullName,
        companyName: updated.companyName ?? formData.companyName,
        phone: updated.phone ?? formData.phone,
        city: updated.city ?? formData.city,
        country: updated.country ?? formData.country,
        role: updated.role,
        emailVerified: updated.emailVerified,
      }
      dispatch(setUser(userPayload))

      const { currentPassword, newPassword, confirmPassword } = passwordData
      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setError('Enter your current password to change it.')
          setSaving(false)
          return
        }
        if (newPassword.length < 8) {
          setError('New password must be at least 8 characters.')
          setSaving(false)
          return
        }
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match.')
          setSaving(false)
          return
        }
        await settingsService.changePassword(currentPassword, newPassword)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }

      setMessage('Profile updated successfully.')
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || 'Update failed. Check your current password if changing it.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600">Manage your account information</p>
        <p className="mt-1 text-sm text-slate-500">
          <Link to="/settings" className="font-medium text-blue-600 hover:text-blue-700">
            Open full settings
          </Link>{' '}
          for addresses, company documents, and security.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <User className="h-5 w-5" />
              Company & contact
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Company name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Compliance</h2>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Licenses and verification documents are managed under{' '}
                <Link to="/settings?tab=company" className="font-medium text-blue-600 hover:text-blue-700">
                  company settings
                </Link>
                .
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Change password</h2>
            <p className="mb-3 text-sm text-slate-500">Leave blank to keep your current password.</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Current password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2 font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <FileText className="h-5 w-5" />
            RFQ history
          </h2>
          <Link
            to="/buyer/rfqs"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {rfqsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : rfqs.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">No RFQs yet.</p>
        ) : (
          <ul className="space-y-3">
            {rfqs.map((rfq) => (
              <li key={rfq.id}>
                <Link
                  to={`/buyer/rfqs/${rfq.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{rfq.title || rfq.rfqNumber || 'RFQ'}</p>
                      <p className="text-sm text-slate-500">
                        {rfq.rfqNumber} · {rfq.responses ?? 0} response{rfq.responses !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="text-sm text-slate-500">{rfq.submittedDate || '—'}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {rfq.status || '—'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Profile
