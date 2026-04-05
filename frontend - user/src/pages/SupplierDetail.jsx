import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowRight,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  FileText,
  Globe,
  Filter,
  X,
  Star,
  Download,
  Factory,
  Users,
  Calendar,
} from 'lucide-react'
import Container from '../components/ui/Container'
import MedicinesProductGrid from '../components/medicines/MedicinesProductGrid'
import Loading from '../components/ui/Loading'
import ErrorState from '../components/ui/ErrorState'
import { suppliersService } from '../services/suppliers.service.js'
import { transformSupplier } from '../utils/dataTransform.js'
import { transformProduct } from '../utils/dataTransform.js'
import { countryToFlagEmoji, stableRatingFromId, stableReviewsFromId } from '../utils/supplierDisplay.js'

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=2000&q=80'

export default function SupplierDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const authUser = useSelector((state) => state.auth.user)
  const [supplier, setSupplier] = useState(null)
  const [supplierProducts, setSupplierProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productFilters, setProductFilters] = useState({
    dosageForm: 'All',
    certification: 'All',
    moq: 'All',
    availability: 'All',
  })

  useEffect(() => {
    loadSupplierData()
  }, [slug])

  useEffect(() => {
    if (supplier?.id) {
      loadSupplierProducts()
    }
  }, [supplier?.id, productFilters])

  const loadSupplierData = async () => {
    try {
      setLoading(true)
      setError(null)
      const supplierData = await suppliersService.getBySlug(slug)
      const transformed = transformSupplier(supplierData)
      setSupplier(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load supplier data')
    } finally {
      setLoading(false)
    }
  }

  const loadSupplierProducts = async () => {
    try {
      const apiFilters = {
        dosageForm: productFilters.dosageForm !== 'All' ? productFilters.dosageForm : undefined,
        availability:
          productFilters.availability !== 'All'
            ? productFilters.availability === 'In Stock'
              ? 'IN_STOCK'
              : productFilters.availability === 'Made to Order'
                ? 'MADE_TO_ORDER'
                : undefined
            : undefined,
        page: 1,
        limit: 100,
      }
      const result = await suppliersService.getProducts(supplier.id, apiFilters)
      const productsData = result.data?.products || result.products || []
      setSupplierProducts(productsData.map(transformProduct))
    } catch {
      setSupplierProducts([])
    }
  }

  useEffect(() => {
    if (supplier) {
      document.title = `${supplier.name} – Verified Pharmaceutical Supplier | Pharmetis`
      const metaDescription = document.querySelector('meta[name="description"]')
      const certs = supplier.certifications?.join(', ') || 'Certified'
      const description = `Source bulk medicines from ${supplier.name}, a verified pharmaceutical supplier in ${supplier.country}. ${certs} certified. ${supplier.totalProducts || 0}+ products available.`
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = description
        document.head.appendChild(meta)
      }
    }
  }, [supplier])

  const filteredProducts = useMemo(() => {
    if (!supplierProducts?.length) return []
    return supplierProducts.filter((product) => {
      const matchesDosageForm =
        productFilters.dosageForm === 'All' ||
        product.dosageForm?.toUpperCase() === productFilters.dosageForm.toUpperCase()
      const matchesCertification =
        productFilters.certification === 'All' ||
        (product.certifications || []).some((cert) =>
          cert.toLowerCase().includes(productFilters.certification.toLowerCase())
        )
      const matchesAvailability =
        productFilters.availability === 'All' || product.availability === productFilters.availability
      const matchesMOQ =
        productFilters.moq === 'All' ||
        (() => {
          if (!product.moq) return false
          const moqStr = String(product.moq).replace(/[^0-9]/g, '')
          const moqValue = parseInt(moqStr, 10) || 0
          switch (productFilters.moq) {
            case '0-1000':
              return moqValue >= 0 && moqValue <= 1000
            case '1000-10000':
              return moqValue >= 1000 && moqValue <= 10000
            case '10000+':
              return moqValue >= 10000
            default:
              return true
          }
        })()
      return matchesDosageForm && matchesCertification && matchesAvailability && matchesMOQ
    })
  }, [productFilters, supplierProducts])

  const handleFilterChange = (filterName, value) => {
    setProductFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const handleResetFilters = () => {
    setProductFilters({
      dosageForm: 'All',
      certification: 'All',
      moq: 'All',
      availability: 'All',
    })
  }

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product, supplier } })
  }

  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug}`)
  }

  const goSendRfq = (extra) => {
    navigate('/send-rfq', {
      state: {
        supplier,
        ...(extra || {}),
      },
    })
  }

  const activeFiltersCount = Object.values(productFilters).filter((v) => v !== 'All').length

  const businessTypes = useMemo(() => {
    if (!supplier) return []
    const cap = supplier.capability || {}
    const mfg = supplier.manufacturingCapability || []
    const exp = supplier.exportMarkets || []
    const types = []
    if (mfg.length || cap.dosageForms?.length) types.push('Manufacturer')
    if (exp.length) types.push('Exporter')
    types.push('Wholesaler')
    return types
  }, [supplier])

  const mainProductsLine = useMemo(() => {
    if (!supplier) return ''
    const ther = supplier.therapeutics?.trim()
    if (ther) return ther
    const forms = supplier.capability?.dosageForms || []
    return forms.length ? forms.join(', ') : 'Pharmaceutical finished dosage forms'
  }, [supplier])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 py-8">
        <Loading message="Loading supplier details..." fullScreen={false} />
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 py-8">
        <ErrorState
          message={error || 'Supplier not found'}
          retry="Back to Suppliers"
          onRetry={() => navigate('/suppliers')}
        />
      </div>
    )
  }

  const s = {
    ...supplier,
    certifications: supplier.certifications || [],
    manufacturingCapability: supplier.manufacturingCapability || [],
    exportMarkets: supplier.exportMarkets || [],
    regulatoryApprovals: supplier.regulatoryApprovals || [],
    compliance: supplier.compliance || {},
    capability: supplier.capability || {
      dosageForms: ['Tablets', 'Capsules'],
      productionCapacity: 'Contact for details',
      packagingTypes: ['Blister packs', 'Bottles'],
      coldChain: false,
      minOrderTerms: 'MOQ: Contact supplier',
    },
    performance: supplier.performance || {
      totalOrders: 0,
      countriesServed: 1,
      avgResponseTime: 'Contact supplier',
      repeatBuyersPercent: 0,
    },
    quickStats: supplier.quickStats || {
      responseTime: 'Contact supplier',
      verifiedStatus: supplier.isVerified ? 'Verified' : 'Not Verified',
      onTimeDelivery: 'N/A',
    },
  }

  const rating = stableRatingFromId(s.id)
  const reviewCount = stableReviewsFromId(s.id)
  const yearEstablished =
    s.yearsInBusiness > 0 ? new Date().getFullYear() - s.yearsInBusiness : null

  const hasGmpBadge =
    s.compliance.whoGmp ||
    s.certifications.some((c) => /gmp/i.test(c) && !/who/i.test(c)) ||
    s.certifications.some((c) => String(c).trim().toUpperCase() === 'GMP')

  const hasCe = s.certifications.some((c) => String(c).toUpperCase().includes('CE'))

  const certCards = [
    { key: 'whoGmp', label: 'WHO-GMP', active: s.compliance.whoGmp, icon: ShieldCheck },
    { key: 'fda', label: 'FDA', active: s.compliance.fda, icon: Award },
    { key: 'iso', label: 'ISO', active: s.compliance.iso, icon: CheckCircle2 },
    { key: 'gmp', label: 'GMP', active: hasGmpBadge, icon: Factory },
    { key: 'ce', label: 'CE', active: hasCe, icon: Globe },
  ]

  const complianceDocs = [
    {
      id: 'coa',
      title: 'COA',
      description: 'Certificate of analysis for batch release and quality verification.',
      highlight: s.compliance.coa,
    },
    {
      id: 'msds',
      title: 'MSDS',
      description: 'Material safety data sheets for handling and transport.',
      highlight: false,
    },
    {
      id: 'spec',
      title: 'Product specification',
      description: 'Technical specifications and release criteria.',
      highlight: false,
    },
    {
      id: 'mfg',
      title: 'Manufacturing license',
      description: 'Site and manufacturing authorization references.',
      highlight: s.regulatoryApprovals?.length > 0,
    },
    {
      id: 'fsc',
      title: 'Free sale certificate',
      description: 'Export and market-access documentation where applicable.',
      highlight: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter,system-ui,sans-serif] text-gray-900 antialiased">
      {/* —— 1. Header banner + glass card —— */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center sm:h-56 md:h-64"
          style={{ backgroundImage: `url(${BANNER_IMAGE})` }}
          role="img"
          aria-label="Abstract pharmaceutical facility background"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-gray-900/55 via-gray-900/45 to-gray-900/70 sm:h-56 md:h-64"
          aria-hidden
        />

        <Container className="relative z-10 -mt-16 sm:-mt-20 md:-mt-24">
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:h-24 sm:w-24">
                  {s.image ? (
                    <img src={s.image} alt={`${s.name} logo`} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 text-gray-400" strokeWidth={1.25} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 gap-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                      {s.name}
                    </h1>
                    {s.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Verified supplier
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-base" aria-hidden>
                        {countryToFlagEmoji(s.country)}
                      </span>
                      <MapPin className="h-4 w-4 text-blue-600" aria-hidden />
                      {[s.city, s.country].filter(Boolean).join(', ') || s.country}
                    </span>
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-xl">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Years in business
                      </p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900">
                        {s.yearsInBusiness ? `${s.yearsInBusiness}+` : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Response time
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {s.quickStats.responseTime}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 sm:col-span-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        Rating
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-lg font-bold text-gray-900">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
                        {rating}
                        <span className="text-sm font-normal text-gray-500">({reviewCount} reviews)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[200px] lg:shrink-0">
                {authUser?.role === 'BUYER' && supplier?.id ? (
                  <Link
                    to={`/buyer/messages?supplierId=${supplier.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                  >
                    Message
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => goSendRfq()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Send RFQ
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pb-16 pt-10 md:pt-12">
        {/* —— 2. About (compact: no wide empty column) —— */}
        <section className="mb-10 md:mb-12" aria-labelledby="about-heading">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 id="about-heading" className="text-lg font-bold tracking-tight text-gray-900 md:text-xl">
                  About company
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 md:text-sm">
                  Capabilities, scale, and export footprint
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
                {businessTypes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 ring-1 ring-blue-100 md:text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-pretty text-sm leading-relaxed text-gray-700">
              {s.description?.trim() || 'This supplier has not added a detailed company description yet.'}
            </p>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">At a glance</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                      <PackageIcon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Main products</p>
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900" title={mainProductsLine}>
                        {mainProductsLine}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Year est.</p>
                      <p className="text-sm font-semibold tabular-nums text-gray-900">{yearEstablished ?? '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                      <Users className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Employees</p>
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                        Contact for workforce size
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                      <Globe className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Export</p>
                      {s.exportMarkets.length ? (
                        <div className="mt-0.5 flex max-h-14 flex-wrap gap-1 overflow-y-auto">
                          {s.exportMarkets.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-800"
                            >
                              <span aria-hidden>{countryToFlagEmoji(m)}</span>
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-600">Not listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* —— 3. Certifications —— */}
        <section className="mb-12 md:mb-16" aria-labelledby="certs-heading">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 id="certs-heading" className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              Certifications
            </h2>
            <p className="mt-2 text-sm text-gray-600">Quality and regulatory badges associated with this supplier.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {certCards.map(({ key, label, active, icon: Icon }) => (
                <div
                  key={key}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center shadow-sm transition ${
                    active
                      ? 'border-blue-200 bg-blue-50/90 ring-1 ring-blue-100'
                      : 'border-gray-200 bg-gray-50/50 opacity-70'
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ring-1 ${
                      active ? 'bg-white text-blue-600 ring-blue-100' : 'bg-white text-gray-400 ring-gray-100'
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{label}</p>
                  {active ? (
                    <span className="mt-1 text-[11px] font-medium text-emerald-700">On file</span>
                  ) : (
                    <span className="mt-1 text-[11px] text-gray-500">Not listed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* —— 4. Products —— */}
        <section className="mb-12 md:mb-16" aria-labelledby="products-heading">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="products-heading" className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Products from this supplier
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} shown
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Filter className="h-4 w-4 text-blue-600" aria-hidden />
                  Filters
                  {activeFiltersCount > 0 ? (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{activeFiltersCount}</span>
                  ) : null}
                </div>
                {activeFiltersCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" aria-hidden />
                    Clear all
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <label className="block text-xs font-medium text-gray-600">
                  Dosage form
                  <select
                    value={productFilters.dosageForm}
                    onChange={(e) => handleFilterChange('dosageForm', e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="All">All</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Certification
                  <select
                    value={productFilters.certification}
                    onChange={(e) => handleFilterChange('certification', e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="All">All</option>
                    <option value="WHO-GMP">WHO-GMP</option>
                    <option value="FDA">FDA</option>
                    <option value="ISO">ISO</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  MOQ
                  <select
                    value={productFilters.moq}
                    onChange={(e) => handleFilterChange('moq', e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="All">All</option>
                    <option value="0-1000">0 – 1,000</option>
                    <option value="1000-10000">1,000 – 10,000</option>
                    <option value="10000+">10,000+</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  Availability
                  <select
                    value={productFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="All">All</option>
                    <option value="In Stock">In stock</option>
                    <option value="Made to Order">Made to order</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-8">
              {filteredProducts.length ? (
                <MedicinesProductGrid
                  products={filteredProducts}
                  onSendRFQ={handleSendRFQ}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
                  No products match these filters.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* —— 5. Compliance & documents —— */}
        <section className="mb-12 md:mb-16" aria-labelledby="docs-heading">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 id="docs-heading" className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              Compliance & documents
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Typical files shared under NDA after qualification. Request through RFQ or compliance desk.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complianceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/50 p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                    <FileText className="h-5 w-5 text-blue-600" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-gray-900">{doc.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-snug text-gray-600">{doc.description}</p>
                  <button
                    type="button"
                    onClick={() => goSendRfq({ rfqDraft: { specialRequirements: `Request: ${doc.title}` } })}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 text-blue-600" aria-hidden />
                    {doc.highlight ? 'Request / download' : 'Request document'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

function PackageIcon({ className = 'h-4 w-4 text-blue-600' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
      />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  )
}
