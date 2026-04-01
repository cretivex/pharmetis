import { useState, useEffect } from 'react'
import api from '../../config/api.js'

const BUSINESS_TYPES = [
  'Wholesaler',
  'Retailer',
  'Manufacturer',
  'Distributor',
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Other'
]

function Company() {
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [drugLicenseNumber, setDrugLicenseNumber] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [website, setWebsite] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data } = await api.get('/users/company')
        const d = data?.data ?? data
        if (cancelled || !d) return
        setCompanyName(d.companyName ?? '')
        setGstNumber(d.gstTaxId ?? d.gstNumber ?? '')
        setDrugLicenseNumber(d.drugLicenseNo ?? d.drugLicenseNumber ?? '')
        setBusinessType(d.businessType ?? '')
        setWebsite(d.website ?? '')
      } catch {
        if (!cancelled) showToast('Failed to load company info', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setToast(null)
    try {
      let uploadedDocumentUrl = null
      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        const uploadResponse = await api.post('/upload/documents', uploadData, {
          headers: { 'Content-Type': undefined }
        })
        uploadedDocumentUrl = uploadResponse.data?.url || uploadResponse.data?.data?.url || null
      }
      await api.put('/buyer/company', {
        companyName,
        gstNumber,
        drugLicenseNumber,
        businessType,
        website,
        document_url: uploadedDocumentUrl || undefined
      })
      showToast('Company profile saved successfully.')
      setFile(null)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save company profile.'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl">
      {toast && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Company profile</h1>
      <p className="text-sm text-slate-500 mb-6">Update your business details.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1.5">
            Company name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label htmlFor="gstNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
            GST / Tax number
          </label>
          <input
            id="gstNumber"
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="GST123456789"
          />
        </div>

        <div>
          <label htmlFor="drugLicenseNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
            Drug license number
          </label>
          <input
            id="drugLicenseNumber"
            type="text"
            value={drugLicenseNumber}
            onChange={(e) => setDrugLicenseNumber(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="DL-12345"
          />
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 mb-1.5">
            Business type
          </label>
          <select
            id="businessType"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select type</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1.5">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-slate-700 mb-1.5">
            Document (optional)
          </label>
          <input
            id="document"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
          />
          {file && (
            <p className="mt-1.5 text-sm text-slate-500">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}

export default Company
