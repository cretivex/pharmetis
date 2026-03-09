import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Search,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Check,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'
import { getSupplierById, updateSupplier, deleteSupplier } from '@/services/suppliers.service'
import { getAllProducts } from '@/services/products.service'

const mockSupplier = {
  companyName: 'BioMed Exports Ltd',
  contactPerson: 'John Smith',
  email: 'contact@biomedexports.com',
  phone: '+1 (555) 234-5678',
  address: '123 Pharma Street, Industrial Area, Mumbai, Maharashtra 400001',
  gstNumber: '27AABCU9603R1ZX',
  status: 'verified',
  createdAt: '2023-01-15',
  updatedAt: '2024-01-20',
  logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
  products: [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      composition: 'Paracetamol 500mg',
      mrp: 150.00,
      expiryDate: '2025-12-31',
      updatedAt: '2024-01-20',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      composition: 'Amoxicillin Trihydrate 250mg',
      mrp: 250.00,
      expiryDate: '2025-11-30',
      updatedAt: '2024-01-19',
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200',
    },
    {
      id: 3,
      name: 'Ibuprofen 400mg',
      composition: 'Ibuprofen 400mg',
      mrp: 180.00,
      expiryDate: '2025-10-15',
      updatedAt: '2024-01-18',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200',
    },
    {
      id: 4,
      name: 'Aspirin 100mg',
      composition: 'Acetylsalicylic Acid 100mg',
      mrp: 95.00,
      expiryDate: '2025-09-20',
      updatedAt: '2024-01-15',
      imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200',
    },
    {
      id: 5,
      name: 'Ciprofloxacin 500mg',
      composition: 'Ciprofloxacin Hydrochloride 500mg',
      mrp: 350.00,
      expiryDate: '2025-08-10',
      updatedAt: '2024-01-10',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200',
    },
  ],
}

function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '' }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [spring])

  return <span>{prefix}{displayValue}{suffix}</span>
}

function StatCard({ label, value, icon: Icon, color, bgColor, index, isCurrency = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass-card rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <CardContent className="pt-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`w-1 h-8 rounded-full ${bgColor} opacity-50`} />
          </div>
          <div className={`text-3xl font-bold mb-1 ${color}`}>
            {isCurrency ? (
              <AnimatedCounter value={parseFloat(value.replace(/[^0-9.]/g, ''))} prefix="$" suffix="" />
            ) : typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProductRow({ product, index }) {
  const [imageError, setImageError] = useState(false)

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isRecentlyUpdated = getDaysAgo(product.updatedAt) <= 7

  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 30) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Expiring Soon' }
    if (daysUntilExpiry < 90) return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Expiring' }
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Valid' }
  }

  const expiryStatus = getExpiryStatus(product.expiryDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass-card rounded-xl border border-border/40 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/50 border border-border/40 group-hover:border-primary/50 transition-colors">
                {!imageError && product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              {isRecentlyUpdated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge variant="warning" className="text-xs px-1.5 py-0.5">
                    <Clock className="w-2.5 h-2.5 mr-1" />
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-0.5 truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.composition}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">${product.mrp.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${expiryStatus.color}`} />
                  <span className={`text-sm font-medium ${expiryStatus.color}`}>
                    {new Date(product.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`${expiryStatus.bg} ${expiryStatus.border} ${expiryStatus.color} border text-xs`}
                >
                  {expiryStatus.label}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadSupplier()
    loadProducts()
  }, [id])

  const loadSupplier = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSupplierById(id)
      setSupplier(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplier details')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await getAllProducts({ supplierId: id, limit: 100 })
      const productsData = response.products || response || []
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (err) {
      setProducts([])
    }
  }

  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleApprove = async () => {
    try {
      setActionLoading('approve')
      await updateSupplier(id, { isVerified: true, isActive: true })
      await loadSupplier()
      toast.success('Supplier approved successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve supplier')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    try {
      setActionLoading('delete')
      await deleteSupplier(id)
      toast.success('Supplier deleted')
      navigate('/suppliers')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete supplier')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading supplier details...</p>
        </div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Supplier not found'}</p>
          <Button onClick={() => navigate('/suppliers')}>Back to Suppliers</Button>
        </div>
      </div>
    )
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.composition?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0)
  const avgMRP = totalProducts > 0 ? totalValue / totalProducts : 0
  const recentlyUpdated = products.filter(p => {
    if (!p.updatedAt) return false
    const updatedDate = new Date(p.updatedAt)
    const daysDiff = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }).length

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-indigo-600/10',
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-600/10',
      isCurrency: true,
    },
    {
      label: 'Avg MRP',
      value: `$${avgMRP.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/20 to-cyan-600/10',
    },
    {
      label: 'Recently Updated',
      value: recentlyUpdated,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-amber-600/10',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Layered Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]" />

      <div className="relative z-10 space-y-6 p-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/suppliers')}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="glass-card rounded-2xl border-2 border-border/40 overflow-hidden relative">
            {/* Gradient Background Strip */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20" />
            
            <CardContent className="pt-8 pb-6 relative">
              <div className="flex items-start gap-6">
                {/* Logo Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-950">
                      {supplier.logo ? (
                        <img
                          src={supplier.logo}
                          alt={supplier.companyName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-12 h-12 text-indigo-400" />
                      )}
                    </div>
                  </div>
                  {supplier.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Supplier Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {supplier.companyName}
                      </h1>
                      <p className="text-lg text-muted-foreground mb-3">
                        {supplier.email && `Email: ${supplier.email}`}
                        {supplier.phone && ` • Phone: ${supplier.phone}`}
                      </p>
                      <div className="flex items-center gap-4">
                        {supplier.isVerified && (
                          <Badge variant="success" className="text-base px-4 py-1.5">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verified Supplier
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Registered {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
                    {supplier.phone && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{supplier.phone}</p>
                        </div>
                      </div>
                    )}
                    {(supplier.city || supplier.country) && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium truncate">
                            {supplier.city || ''}
                            {supplier.city && supplier.country ? ', ' : ''}
                            {supplier.country || ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {supplier.gstNumber && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">GST Number</p>
                          <p className="font-medium">{supplier.gstNumber}</p>
                        </div>
                      </div>
                    )}
                    {supplier.therapeutics && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Therapeutic Areas</p>
                          <p className="font-medium">{supplier.therapeutics || 'Not specified'}</p>
                        </div>
                      </div>
                    )}
                    {supplier.manufacturer && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Manufacturer</p>
                          <p className="font-medium">{supplier.manufacturer || 'Not specified'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!supplier.isVerified && (
                    <Button
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                      onClick={handleApprove}
                      disabled={actionLoading === 'approve'}
                    >
                      {actionLoading === 'approve' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate(`/suppliers/${id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive" 
                    onClick={() => setConfirmDelete(true)}
                    disabled={actionLoading === 'delete'}
                  >
                    {actionLoading === 'delete' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
                <ConfirmModal
                  open={confirmDelete}
                  onOpenChange={setConfirmDelete}
                  title="Delete supplier"
                  message="Are you sure you want to delete this supplier? This action cannot be undone."
                  confirmLabel="Delete"
                  variant="destructive"
                  onConfirm={handleDelete}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              index={index}
              isCurrency={stat.isCurrency}
            />
          ))}
        </div>

        {/* Products Section */}
        <Card className="glass-card rounded-2xl border-2 border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Product Catalog</CardTitle>
              <div className="flex-1 max-w-md ml-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ProductRow 
                    key={product.id} 
                    product={{
                      ...product,
                      name: product.name,
                      composition: product.composition || product.name,
                      mrp: parseFloat(product.price) || 0,
                      expiryDate: product.expiryDate || product.shelfLife || '2025-12-31',
                      updatedAt: product.updatedAt || product.createdAt,
                      imageUrl: product.images?.[0]?.url || product.image
                    }} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
