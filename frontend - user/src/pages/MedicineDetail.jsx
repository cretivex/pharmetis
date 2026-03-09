import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Heart,
  Share2,
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import ProductCard from '../components/ProductCard'
import { productsService } from '../services/products.service.js'
import { transformProduct, transformProductDetail } from '../utils/dataTransform.js'
import { authService } from '../services/auth.service.js'

function MedicineDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [slug])

  // Check if product is saved
  useEffect(() => {
    if (medicine?.id) {
      checkIfSaved()
    }
  }, [medicine?.id])

  const checkIfSaved = async () => {
    if (!authService.isAuthenticated() || !medicine?.id) {
      setIsSaved(false)
      return
    }
    
    try {
      const result = await productsService.getSavedProducts()
      const saved = Array.isArray(result) ? result : (result.data?.data || result.data || result || [])
      setIsSaved(saved.some(p => p.id === medicine.id))
    } catch (_) {
      setIsSaved(false)
    }
  }

  const handleSave = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: `/medicines/${slug}` } })
      return
    }

    if (!medicine?.id) {
      alert('Product ID is missing')
      return
    }

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
      alert(err.message || 'Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/medicines/${slug}`
    const title = `${medicine.name} ${medicine.strength || ''} - Pharmetis`
    const text = `Check out ${medicine.name} ${medicine.strength || ''} on Pharmetis`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch product by slug
      const productData = await productsService.getBySlug(slug)
      const transformed = transformProductDetail(productData)
      setMedicine(transformed)
      
      // Load related products (same category or supplier)
      await loadRelatedProducts(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async (currentProduct) => {
    try {
      // Fetch products from same supplier or category
      const filters = {
        limit: 8,
        page: 1
      }
      
      const result = await productsService.getAll(filters)
      const productsData = result.data?.products || result.products || []
      
      // Filter out current product and transform
      const filtered = productsData
        .filter(p => p.id !== currentProduct.id)
        .slice(0, 4)
        .map(transformProduct)
      
      setRelatedProducts(filtered)
    } catch (err) {
      setRelatedProducts([])
    }
  }

  // Mock medicine data - fallback if API fails
  const mockMedicine = {
    id: 1,
    name: 'Paracetamol',
    strength: '500mg',
    dosageForm: 'Tablet',
    brand: 'Tylenol',
    manufacturer: {
      name: 'MediPharma Industries',
      country: 'India',
      yearsInBusiness: 15,
      totalProducts: 450,
      certifications: ['WHO-GMP', 'FDA', 'ISO 9001'],
      slug: 'medipharma-industries',
    },
    availability: 'In Stock',
    moq: '10,000 units',
    certifications: ['WHO-GMP', 'FDA', 'ISO 9001'],
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop',
    ],
    specifications: {
      apiName: 'Paracetamol (Acetaminophen)',
      composition: 'Paracetamol 500mg',
      packagingType: 'Blister Pack (10x10)',
      shelfLife: '36 months',
      storageConditions: 'Store below 30°C, protect from light and moisture',
      regulatoryApprovals: 'US FDA, EMA, WHO-GMP',
      hsCode: '3004.90.90',
    },
    description:
      'Paracetamol 500mg tablets are a widely used analgesic and antipyretic medication. This pharmaceutical-grade product is manufactured under strict WHO-GMP guidelines, ensuring quality and compliance for bulk pharmaceutical procurement. Suitable for hospital, clinic, and distribution networks requiring reliable bulk supply.',
    compliance: {
      whoGmp: true,
      fda: true,
      iso: true,
      coa: true,
      dmf: true,
    },
    relatedProducts: [
      {
        id: 2,
        name: 'Amoxicillin 250mg',
        brand: 'Amoxil',
        manufacturer: 'GlobalPharma Solutions',
        country: 'Germany',
        certifications: ['WHO-GMP', 'ISO'],
        moq: '5,000 units',
        availability: 'Made to Order',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop',
      },
      {
        id: 3,
        name: 'Ibuprofen 400mg',
        brand: 'Advil',
        manufacturer: 'BioMed Exports Ltd',
        country: 'United Kingdom',
        certifications: ['FDA', 'ISO'],
        moq: '20,000 units',
        availability: 'In Stock',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop',
      },
      {
        id: 4,
        name: 'Metformin 500mg',
        brand: 'Glucophage',
        manufacturer: 'PharmaCore International',
        country: 'United States',
        certifications: ['FDA', 'WHO-GMP'],
        moq: '15,000 units',
        availability: 'In Stock',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      },
    ],
  }

  // SEO: Update document title and meta tags
  useEffect(() => {
    if (!medicine) return
    
    const fullName = `${medicine.name || 'Product'} ${medicine.strength || ''}`
    document.title = `${fullName} ${medicine.dosageForm || 'Product'}s – Bulk Supplier | Pharmetis`

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      const certs = medicine.certifications?.join(', ') || 'Certified'
      metaDescription.setAttribute(
        'content',
        `Source ${fullName} ${medicine.dosageForm || 'Product'}s in bulk from verified suppliers. B2B pharmaceutical marketplace for bulk medicine sourcing. MOQ: ${medicine.moq || 'Contact for MOQ'}. ${certs} certified.`
      )
    }
  }, [medicine])

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }

  const handleViewDetails = (product) => {
    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-') + '-' + (product.strength || '').toLowerCase()
    navigate(`/medicines/${productSlug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <Container className="max-w-7xl mx-auto px-8 pt-16 pb-14">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted-foreground/30 border-t-foreground mx-auto mb-4" />
            <p className="text-sm text-slate-600">Loading product details...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !medicine) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <Container className="max-w-7xl mx-auto px-8 pt-16 pb-14">
          <Link
            to="/medicines"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Medicines
          </Link>
          <div className="text-center py-20">
            <AlertCircle className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Product Not Found</h1>
            <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">{error || 'The product you are looking for does not exist.'}</p>
            <Link to="/medicines">
              <Button variant="primary" className="rounded-xl">Browse All Medicines</Button>
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <Container className="max-w-7xl mx-auto px-8 pt-16 pb-14">
        {/* Back Button */}
        <Link
          to="/medicines"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Medicines
        </Link>

        {/* 1. Hero Section – Product Overview */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-16">
            {/* Image – clean rounded image, no grey container */}
            <div className="rounded-2xl overflow-hidden aspect-square">
              {medicine.images && medicine.images[0] ? (
                <img
                  src={medicine.images[0]}
                  alt={`${medicine.name} ${medicine.strength || ''}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-blue-200">
                  <Package className="w-20 h-20 text-slate-600/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {medicine.name} {medicine.strength || ''}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                <span className="font-medium text-slate-900">Brand:</span> {medicine.brand}
              </p>

              {/* Pharma Meta Grid – no boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-600">Dosage Form</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.dosageForm || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-600">Country of Origin</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.manufacturer?.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-600">Availability</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.availability}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-600">Minimum Order</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.moq}</p>
                </div>
              </div>

              {/* Certifications – inline, no tiles */}
              {(medicine.certifications || []).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(medicine.certifications || []).map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Icons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSaved
                      ? 'text-red-600 hover:bg-red-500/10'
                      : 'text-slate-600 hover:bg-slate-100'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={isSaved ? 'Unlike product' : 'Like product'}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  )}
                  <span>{isSaved ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Primary Actions – not full width */}
              <div className="flex gap-4 mt-10">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] text-base font-semibold"
                  onClick={() => handleSendRFQ(medicine)}
                >
                  Send RFQ
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Key Specifications – definition list style, no boxes */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mt-16">
            {(() => {
              const specsObj = medicine.specifications || {};
              if (!specsObj.hasOwnProperty('therapeutics')) {
                specsObj.therapeutics = 'Not specified';
              }
              const specs = Object.entries(specsObj)
                .filter(([key, value]) => {
                  if (key === 'therapeutics') return true;
                  return value !== null && value !== 'N/A' && value !== 'Contact supplier' && value !== 'Not specified';
                });
              const labels = {
                apiName: 'API Name',
                composition: 'Salt Composition',
                therapeutics: 'Therapeutic Areas',
                packagingType: 'Packaging Type',
                shelfLife: 'Shelf Life',
                storageConditions: 'Storage Conditions',
                regulatoryApprovals: 'Regulatory Approvals',
                hsCode: 'HS Code',
              };
              return specs.map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs uppercase tracking-wide text-slate-600">{labels[key] || key}</p>
                  <p className="text-base font-medium text-slate-900 mt-1">{value || 'Not specified'}</p>
                </div>
              ));
            })()}
            {/* Therapeutics always visible */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-600">Therapeutic Areas</p>
              <p className="text-base font-medium text-slate-900 mt-1">
                {medicine.specifications?.therapeutics && medicine.specifications.therapeutics !== 'Not specified'
                  ? medicine.specifications.therapeutics
                  : 'Not specified'}
              </p>
            </div>
          </div>
        </section>

        {/* Pharma identifiers: Compare To, NDC, Strength, Pack Size – clean grid, no background */}
        {(medicine.compareTo || medicine.ndcNumber || medicine.strength || medicine.packSize) && (
          <section className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-600">Compare To</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.compareTo || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-600">NDC Number</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.ndcNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-600">Strength</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.strength || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-600">Pack Size</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{medicine.packSize || '—'}</p>
              </div>
            </div>
          </section>
        )}

        {/* 3. Description Section – editorial, clean typography */}
        <section className="mt-20 max-w-3xl">
          <div className="h-px bg-border my-12" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4">Description</h2>
          <p className="leading-relaxed text-slate-600">{medicine.description}</p>
          <ul className="list-disc list-inside space-y-2 mt-4 leading-relaxed text-slate-600">
            <li>Manufactured under strict WHO-GMP guidelines</li>
            <li>Suitable for bulk pharmaceutical procurement</li>
            <li>Compliant with international regulatory standards</li>
            <li>Ideal for hospital, clinic, and distribution networks</li>
          </ul>
        </section>

        {/* 4. Compliance – soft horizontal card, larger icons, no boxed tiles */}
        <section>
          <div className="bg-white rounded-2xl p-8 mt-16 border border-blue-200">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">Compliance & Certifications</h2>
            <div className="flex flex-wrap gap-8 md:gap-12">
              {[
                { key: 'whoGmp', label: 'WHO-GMP', icon: ShieldCheck },
                { key: 'fda', label: 'FDA', icon: Award },
                { key: 'iso', label: 'ISO', icon: CheckCircle2 },
                { key: 'coa', label: 'COA', icon: FileText },
                { key: 'dmf', label: 'DMF', icon: FileCheck },
              ].map((cert) => (
                <div
                  key={cert.key}
                  className={`flex items-center gap-4 ${!medicine.compliance?.[cert.key] ? 'opacity-50' : ''}`}
                >
                  <cert.icon
                    className={`w-10 h-10 shrink-0 ${
                      medicine.compliance?.[cert.key] ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{cert.label}</div>
                    {medicine.compliance?.[cert.key] && (
                      <div className="text-xs text-slate-600 mt-0.5">Certified</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Manufacturer – minimal card, CTA aligned right */}
        <section>
          <div className="mt-20 bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4">Manufacturer</h2>
                <Link
                  to={medicine.manufacturer?.slug ? `/suppliers/${medicine.manufacturer.slug}` : '#'}
                  className="text-lg font-medium text-slate-900 hover:underline inline-flex items-center gap-2 group"
                >
                  {medicine.manufacturer?.name || 'N/A'}
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-900" />
                </Link>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {medicine.manufacturer?.country || 'N/A'}
                </p>
                <div className="flex gap-6 mt-4 text-sm">
                  <span className="text-slate-600">
                    <span className="font-medium text-slate-900">{medicine.manufacturer?.yearsInBusiness || 0}+</span> years
                  </span>
                  <span className="text-slate-600">
                    <span className="font-medium text-slate-900">{medicine.manufacturer?.totalProducts || 0}+</span> products
                  </span>
                </div>
                {(medicine.manufacturer?.certifications || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(medicine.manufacturer?.certifications || []).map((cert, index) => (
                      <span
                        key={index}
                        className="text-xs font-medium text-slate-600"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <Link to={medicine.manufacturer?.slug ? `/suppliers/${medicine.manufacturer.slug}` : '#'}>
                  <Button variant="primary" size="lg" className="rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                    View Supplier Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Related Products */}
        <section className="mt-20">
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Related Products</h2>
            <p className="text-sm text-slate-600 mt-1">Similar medicines from verified suppliers</p>
          </div>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSendRFQ={handleSendRFQ}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No related products available</p>
            </div>
          )}
        </section>
      </Container>
    </div>
  )
}

export default MedicineDetail
