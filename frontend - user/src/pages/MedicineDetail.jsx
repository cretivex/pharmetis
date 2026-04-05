import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Award,
  FileCheck,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Clock,
  Truck,
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import MedicinesProductGrid from '../components/medicines/MedicinesProductGrid'
import { medicineCardSurfaceClass } from '../components/medicines/medicineCardStyles'
import { productsService } from '../services/products.service.js'
import { transformProduct, transformProductDetail } from '../utils/dataTransform.js'
import { authService } from '../services/auth.service.js'
import { shippingService } from '../services/shipping.service.js'
import { useCurrency } from '../contexts/CurrencyContext.jsx'

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-950 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-black/20 transition hover:bg-neutral-800 hover:shadow-lg active:scale-[0.99] disabled:opacity-50'
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'packaging', label: 'Packaging' },
  { id: 'shipping', label: 'Shipping' },
]

function countryFlagEmoji(country) {
  if (!country || typeof country !== 'string') return '🌐'
  const c = country.trim().toLowerCase()
  const map = {
    india: '🇮🇳',
    'united states': '🇺🇸',
    usa: '🇺🇸',
    germany: '🇩🇪',
    'united kingdom': '🇬🇧',
    uk: '🇬🇧',
    china: '🇨🇳',
    japan: '🇯🇵',
    france: '🇫🇷',
    canada: '🇨🇦',
  }
  return map[c] || '🌐'
}

function StarsRow({ rating = 4.9 }) {
  const full = Math.floor(rating)
  const partial = rating - full >= 0.5
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem] ${
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && partial
                ? 'fill-amber-400/70 text-amber-400'
                : 'fill-slate-200 text-slate-200'
          }`}
          strokeWidth={0}
        />
      ))}
    </div>
  )
}

function MedicineDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [medicine, setMedicine] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [shippingEstimate, setShippingEstimate] = useState(null)

  useEffect(() => {
    loadProduct()
  }, [slug])

  useEffect(() => {
    if (!medicine) return
    const base = medicine.price != null ? Number(medicine.price) : 0
    const orderValueUsd = base > 0 ? Math.max(base * 12, base) : 2500
    const cold =
      typeof medicine.dosageForm === 'string' &&
      /inject|vial|cold|refrigerat/i.test(medicine.dosageForm)
    shippingService
      .getEstimate({
        destinationCountry: 'US',
        orderValueUsd,
        coldChain: cold,
      })
      .then(setShippingEstimate)
      .catch(() => setShippingEstimate(null))
  }, [medicine])

  useEffect(() => {
    if (medicine?.id) checkIfSaved()
  }, [medicine?.id])

  const checkIfSaved = async () => {
    if (!authService.isAuthenticated() || !medicine?.id) {
      setIsSaved(false)
      return
    }
    try {
      const result = await productsService.getSavedProducts()
      const saved = Array.isArray(result) ? result : result.data?.data || result.data || result || []
      setIsSaved(saved.some((p) => p.id === medicine.id))
    } catch (_) {
      setIsSaved(false)
    }
  }

  const handleSave = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/medicines/${slug}` } })
      return
    }
    if (!medicine?.id) return
    try {
      setSaving(true)
      if (isSaved) {
        await productsService.unsaveProduct(medicine.id)
        setIsSaved(false)
      } else {
        await productsService.saveProduct(medicine.id)
        setIsSaved(true)
      }
    } catch (err) {
      alert(err.message || 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/medicines/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: medicine?.name, url })
      } catch (e) {
        if (e.name !== 'AbortError') navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const productData = await productsService.getBySlug(slug)
      const transformed = transformProductDetail(productData)
      setMedicine(transformed)
      await loadRelatedProducts(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async (currentProduct) => {
    try {
      const result = await productsService.getAll({ limit: 12, page: 1 })
      const productsData = result?.products || result?.data?.products || []
      const filtered = productsData
        .filter((p) => p.id !== currentProduct.id)
        .slice(0, 8)
        .map(transformProduct)
      setRelatedProducts(filtered)
    } catch {
      setRelatedProducts([])
    }
  }

  useEffect(() => {
    if (!medicine) return
    const fullName = `${medicine.name || 'Product'} ${medicine.strength || ''}`
    document.title = `${fullName} – Bulk Supplier | Pharmetis`
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Source ${fullName} from verified suppliers. MOQ: ${medicine.moq || 'Contact'}.`
      )
    }
  }, [medicine])

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product: product || medicine } })
  }

  const handleViewDetails = (product) => {
    if (product.slug) {
      navigate(`/medicines/${product.slug}`)
      return
    }
    const fallback = `${String(product.name || '')
      .toLowerCase()
      .replace(/\s+/g, '-')}-${String(product.strength || '')
      .toLowerCase()
      .replace(/\s+/g, '')}`
    navigate(`/medicines/${fallback}`)
  }

  const images = medicine?.images?.length ? medicine.images : []

  const breadcrumbCategory =
    medicine?.specifications?.therapeutics && medicine.specifications.therapeutics !== 'Not specified'
      ? String(medicine.specifications.therapeutics).split(',')[0].trim()
      : 'Catalog'

  const breadcrumbSub =
    medicine?.dosageForm && medicine.dosageForm !== 'N/A' ? medicine.dosageForm : 'Products'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f4f8] pt-2">
        <Container className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0066ff]" />
            <p className="text-sm text-slate-600">Loading product…</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-[#f1f4f8] pt-2">
        <Container className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/medicines"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0066ff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Medicines
          </Link>
          <div className={`py-16 text-center ${medicineCardSurfaceClass}`}>
            <AlertCircle className="mx-auto mb-4 h-14 w-14 text-slate-400" />
            <h1 className="mb-2 text-xl font-semibold text-slate-900">Product Not Found</h1>
            <p className="mx-auto mb-8 max-w-md text-sm text-slate-600">{error || 'Product does not exist.'}</p>
            <Link to="/medicines">
              <Button variant="primary" className="rounded-xl">
                Browse Medicines
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const displayImage = images[0] || null
  const certBadges = (medicine.certifications || []).slice(0, 5)
  const displayCerts = certBadges.length ? certBadges : ['WHO-GMP', 'ISO', 'FDA'].slice(0, 3)

  const packagingLines = [
    medicine.specifications?.packagingType && medicine.specifications.packagingType !== 'Contact supplier'
      ? medicine.specifications.packagingType
      : 'Standard export packaging as per supplier specification.',
    'Shipped with batch documentation and certificates where applicable.',
  ]

  const supplierCity = medicine.manufacturer?.city || ''
  const supplierCountry = medicine.manufacturer?.country || ''
  const locationLine = [supplierCity, supplierCountry].filter(Boolean).join(', ') || '—'
  const apiLine =
    medicine.specifications?.apiName && medicine.specifications.apiName !== 'N/A'
      ? medicine.specifications.apiName
      : null
  const detailRows = [
    { label: 'Tablet / product name', value: medicine.name || '—' },
    {
      label: 'Formula (salt composition)',
      value:
        medicine.specifications?.composition && medicine.specifications.composition !== 'N/A'
          ? medicine.specifications.composition
          : '—',
    },
    {
      label: 'API',
      value:
        medicine.specifications?.apiName && medicine.specifications.apiName !== 'N/A'
          ? medicine.specifications.apiName
          : '—',
    },
    { label: 'API dose / strength', value: medicine.strength || '—' },
    { label: 'Dosage form', value: medicine.dosageForm || '—' },
    {
      label: 'Therapeutic area',
      value:
        medicine.specifications?.therapeutics && medicine.specifications.therapeutics !== 'Not specified'
          ? medicine.specifications.therapeutics
          : '—',
    },
    { label: 'Manufacturing company', value: medicine.manufacturer?.name || '—' },
  ]

  return (
    <div className="min-h-screen bg-[#f1f4f8] pb-12 pt-2 sm:pb-16">
      <Container className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="mb-5 flex flex-wrap items-center gap-1 text-[13px] text-slate-500"
          aria-label="Breadcrumb"
        >
          <Link to="/medicines" className="font-medium text-[#0066ff] hover:underline">
            Medicines
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="max-w-[120px] truncate sm:max-w-none">{breadcrumbCategory}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="max-w-[100px] truncate sm:max-w-none">{breadcrumbSub}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="max-w-[200px] truncate font-medium text-slate-800">
            {medicine.name}
            {medicine.strength ? ` ${medicine.strength}` : ''}
          </span>
        </nav>

        {/* Top: compact image | product info — equal-height columns on lg */}
        <div className={`overflow-hidden ${medicineCardSurfaceClass}`}>
          <div className="grid grid-cols-1 items-stretch gap-4 p-3 sm:p-4 lg:grid-cols-2 lg:gap-6 lg:p-5">
            {/* Left — single image, fixed min height, centered */}
            <div className="flex min-h-0 min-w-0 flex-col border-b border-slate-100 pb-4 lg:border-b-0 lg:border-r lg:border-slate-100 lg:pb-0 lg:pr-6">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Product image</p>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`rounded-lg p-1.5 transition ${isSaved ? 'text-red-600' : 'text-slate-500 hover:bg-slate-100'}`}
                    aria-label={isSaved ? 'Remove from saved' : 'Save product'}
                  >
                    {saving ? (
                      <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0066ff]" />
                    ) : (
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex min-h-[380px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-300/80 bg-slate-50/90 px-2 py-2">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={`${medicine.name} ${medicine.strength || ''}`}
                    className="max-h-[340px] w-full max-w-full object-contain object-center"
                  />
                ) : (
                  <div className="flex h-[340px] w-full items-center justify-center">
                    <Package className="h-16 w-16 text-slate-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Right — product info (matches row height) */}
            <aside className="flex min-h-0 min-w-0 flex-col lg:sticky lg:top-14 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto">
              <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
                <h1 className="text-xl font-bold leading-tight text-[#0c1a33] sm:text-2xl">{medicine.name}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {apiLine ? (
                    <>
                      <span className="font-medium text-slate-800">API:</span> {apiLine}
                    </>
                  ) : (
                    <span className="text-slate-500">API: —</span>
                  )}
                  {medicine.dosageForm ? (
                    <span className="block sm:inline sm:before:content-['·_'] sm:before:mx-1">
                      <span className="font-medium text-slate-800">Dosage:</span> {medicine.dosageForm}
                    </span>
                  ) : null}
                  {medicine.strength ? (
                    <span className="block sm:inline sm:before:content-['·_'] sm:before:mx-1">
                      <span className="font-medium text-slate-800">Strength:</span> {medicine.strength}
                    </span>
                  ) : null}
                </p>

                {medicine.price != null && medicine.price > 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Indicative list price
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                      From {formatPrice(medicine.price, medicine.currency || 'USD')}
                      <span className="ml-1 text-xs font-normal text-slate-500">/ unit (MOQ applies)</span>
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Final price is quoted per RFQ; volume and Incoterms affect totals.
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {displayCerts.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-[#0066ff]/35 bg-[rgba(0,102,255,0.06)] px-2.5 py-1 text-xs font-semibold text-[#0052cc]"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none">{countryFlagEmoji(supplierCountry)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Supplier:{' '}
                        <span className="break-words">{medicine.manufacturer?.name}</span>
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified supplier
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {locationLine}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      5–24h avg response (business days)
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="text-lg font-bold tabular-nums text-slate-900">4.9</span>
                  <StarsRow rating={4.9} />
                  <button type="button" className="text-sm font-medium text-[#0066ff] hover:underline">
                    182 reviews
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Tabs + content — full width */}
        <div className={`mt-6 overflow-hidden ${medicineCardSurfaceClass}`}>
          <div className="flex gap-0 overflow-x-auto border-b border-slate-200 bg-white px-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition ${
                  activeTab === t.id
                    ? 'border-[#0066ff] text-[#0066ff]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-8">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-base font-semibold text-slate-900">Description</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{medicine.description}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Technical details
                </p>
                <dl className="divide-y divide-slate-100 text-sm">
                  {detailRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,42%)_1fr] sm:gap-4"
                    >
                      <dt className="font-medium text-slate-500">{row.label}</dt>
                      <dd className="break-words font-semibold text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {activeTab === 'certifications' && (
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'whoGmp', label: 'WHO-GMP', icon: ShieldCheck },
                  { key: 'fda', label: 'FDA', icon: Award },
                  { key: 'iso', label: 'ISO', icon: CheckCircle2 },
                  { key: 'coa', label: 'COA', icon: FileText },
                  { key: 'dmf', label: 'DMF', icon: FileCheck },
                ].map((c) => (
                  <div
                    key={c.key}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      medicine.compliance?.[c.key]
                        ? 'border-[#0066ff]/25 bg-[rgba(0,102,255,0.04)]'
                        : 'border-slate-100 bg-slate-50 opacity-75'
                    }`}
                  >
                    <c.icon className="h-7 w-7 text-slate-700" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                      {medicine.compliance?.[c.key] && (
                        <p className="text-xs font-medium text-[#0066ff]">Documentation on file</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                <Star className="mx-auto h-9 w-9 text-amber-300" />
                <p className="mt-3 text-sm font-medium text-slate-800">Buyer reviews</p>
                <p className="mt-1 text-sm text-slate-500">Verified buyer feedback will appear here.</p>
              </div>
            )}
            {activeTab === 'packaging' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">
                  Packaging type:{' '}
                  <span className="font-semibold text-slate-900">
                    {medicine.specifications?.packagingType || 'As per supplier'}
                  </span>
                </p>
                <ul className="space-y-3">
                  {packagingLines.map((line, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="prose prose-sm max-w-none text-slate-600">
                <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <Truck className="h-8 w-8 shrink-0 text-[#0066ff]" />
                  <div>
                    <p className="font-semibold text-slate-900">Export & logistics</p>
                    <p className="mt-2 text-sm leading-relaxed">
                      Lead times, Incoterms, and cold-chain handling are confirmed after RFQ with the supplier.
                      Pharmetis connects you to verified partners; final shipping terms are agreed in your quotation.
                    </p>
                    <p className="mt-3 text-sm">
                      <span className="font-medium text-slate-800">Typical dispatch:</span> subject to MOQ,
                      documentation, and destination import rules.
                    </p>
                  </div>
                </div>
                {shippingEstimate?.tiers?.length ? (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Estimated delivery options</p>
                    <ul className="space-y-2">
                      {shippingEstimate.tiers.map((tier) => (
                        <li
                          key={tier.id}
                          className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <span className="font-medium text-slate-900">{tier.label}</span>
                          <span className="text-slate-500">
                            {' '}
                            · {tier.minDays}–{tier.maxDays} business days (indicative)
                          </span>
                          {tier.description ? (
                            <span className="mt-1 block text-xs text-slate-500">{tier.description}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {shippingEstimate.shippingCostHintUsd != null ? (
                      <p className="text-xs text-slate-500">
                        Rough freight hint for sample order value:{' '}
                        {formatPrice(shippingEstimate.shippingCostHintUsd, 'USD')} (not a binding quote).
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-500">{shippingEstimate.disclaimer}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Supplier card */}
        {medicine.manufacturer?.slug && (
          <section className={`mt-6 overflow-hidden p-6 sm:p-8 ${medicineCardSurfaceClass}`}>
            <h2 className="text-lg font-bold text-slate-900">Supplier</h2>
            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xl font-semibold text-slate-900">{medicine.manufacturer.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {locationLine}
                </p>
                {medicine.manufacturer.yearsInBusiness > 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{medicine.manufacturer.yearsInBusiness}+</span>{' '}
                    years in business
                  </p>
                )}
                {medicine.manufacturer.certifications?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {medicine.manufacturer.certifications.slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to={`/suppliers/${medicine.manufacturer.slug}`}
                className={`${BTN_PRIMARY} shrink-0 px-8 py-3`}
              >
                View company profile
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Related products — grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Related products</h2>
            <p className="mt-0.5 text-sm text-slate-500">Similar listings from verified suppliers</p>
            <div className="mt-5">
              <MedicinesProductGrid
                products={relatedProducts}
                onSendRFQ={handleSendRFQ}
                onViewDetails={handleViewDetails}
                gridClassName="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
              />
            </div>
          </section>
        )}
      </Container>
    </div>
  )
}

export default MedicineDetail
