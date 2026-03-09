import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllProducts, updateProduct, deleteProduct } from '@/services/products.service'
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Package,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  MoreVertical,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

// Using real API data

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'outline'
    default:
      return 'default'
  }
}

const getExpiryStatus = (expiryDate) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return { label: 'Expired', color: 'text-red-400', bgColor: 'bg-red-500/10' }
  if (diffDays <= 90) return { label: 'Expiring Soon', color: 'text-amber-400', bgColor: 'bg-amber-500/10' }
  return { label: 'Valid', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getDaysAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export default function Products() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRows, setSelectedRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // single id (string) or 'bulk'
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    loadProducts()
  }, [statusFilter, page])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page,
        limit,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      }
      const data = await getAllProducts(params)
      const list = Array.isArray(data) ? data : (data?.products || [])
      setProducts(list)
      const pag = data?.pagination
      if (pag) setTotal(pag.total ?? list.length)
      else setTotal(list.length)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const transformProduct = (product) => {
    // Get expiry date from shelfLife or calculate from expiryDate if available
    const expiryDate = product.shelfLife ? null : (product.expiryDate ? new Date(product.expiryDate) : null)
    
    // Get first category name
    const categoryName = product.productCategories?.[0]?.category?.name || ''
    
    // Get first image URL
    const imageUrl = product.images?.[0]?.url || '/placeholder.png'
    
    return {
      id: product.id,
      name: product.name || 'Unknown Product',
      composition: product.composition || '',
      mrp: parseFloat(product.price || 0),
      expiry: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
      lastUpdated: product.updatedAt || product.createdAt,
      status: product.isActive !== false ? 'active' : 'inactive',
      image: imageUrl,
      category: categoryName,
      manufacturer: product.manufacturer || product.supplier?.companyName || '',
    }
  }

  const transformedProducts = products.map(transformProduct)

  const filteredProducts = transformedProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredProducts.map(product => product.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const runDelete = async (id) => {
    try {
      setActionLoading(id)
      await deleteProduct(id)
      await loadProducts()
      toast.success('Product deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product')
      throw err
    } finally {
      setActionLoading(null)
    }
  }
  const runBulkDelete = async () => {
    try {
      setActionLoading('bulk')
      await Promise.all(selectedRows.map(id => deleteProduct(id)))
      setSelectedRows([])
      await loadProducts()
      toast.success(`${selectedRows.length} product(s) deleted successfully`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete products')
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (confirmDelete === 'bulk') await runBulkDelete()
    else if (confirmDelete) await runDelete(confirmDelete)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-6 space-y-4">
        {/* Page Header */}
        <Section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <SectionTitle>Product Catalog</SectionTitle>
              <SectionSubtitle>Manage pharmaceutical product inventory</SectionSubtitle>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-indigo-500 to-cyan-500"
                onClick={() => navigate('/products/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button 
                variant="outline" 
                size="sm"
onClick={() => toast.info('Export functionality coming soon')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Section>

        {/* Filters */}
        <Panel>
          <PanelContent className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-sm bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between"
              >
                <p className="text-xs text-muted-foreground">
                  {selectedRows.length} product{selectedRows.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      // TODO: Implement bulk export
                      toast.info('Bulk export functionality coming soon')
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs text-destructive"
                    onClick={() => setConfirmDelete('bulk')}
                    disabled={actionLoading === 'bulk'}
                  >
                    {actionLoading === 'bulk' ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </PanelContent>
        </Panel>

        {/* Products Table */}
        <Panel>
          <PanelHeader>
            <PanelTitle>All Products ({filteredProducts.length})</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[10px] uppercase text-muted-foreground font-semibold border-b border-slate-800 bg-slate-800/30">
              <div className="col-span-1">
                <Checkbox
                  checked={selectedRows.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="col-span-3">Product</div>
              <div className="col-span-2">Composition</div>
              <div className="col-span-1">MRP</div>
              <div className="col-span-1">Expiry</div>
              <div className="col-span-1">Last Updated</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-slate-800">
              {filteredProducts.map((product, index) => {
                const expiryStatus = getExpiryStatus(product.expiry)
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={selectedRows.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectRow(product.id, checked)}
                      />
                    </div>

                    {/* Product */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded bg-slate-800/50 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <Package className="w-6 h-6 text-muted-foreground hidden" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm mb-0.5 truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{product.manufacturer}</div>
                      </div>
                    </div>

                    {/* Composition */}
                    <div className="col-span-2 flex items-center">
                      <div className="text-sm text-muted-foreground truncate">{product.composition}</div>
                    </div>

                    {/* MRP */}
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold text-sm">{product.mrp.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="col-span-1 flex items-center">
                      <div className="flex flex-col">
                        <div className={`text-xs font-medium ${expiryStatus.color}`}>
                          {formatDate(product.expiry)}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 mt-0.5 w-fit ${expiryStatus.bgColor} ${expiryStatus.color} border-0`}
                        >
                          {expiryStatus.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{getDaysAgo(product.lastUpdated)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex items-center">
                      <Badge variant={getStatusVariant(product.status)} className="text-[10px] px-1.5 py-0">
                        {product.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelete(product.id)}
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            {total > 0 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </PanelContent>
        </Panel>

        <ConfirmModal
          open={!!confirmDelete}
          onOpenChange={(open) => !open && setConfirmDelete(null)}
          title="Delete product(s)"
          message={confirmDelete === 'bulk'
            ? `Are you sure you want to delete ${selectedRows.length} product(s)? This cannot be undone.`
            : 'Are you sure you want to delete this product? This cannot be undone.'}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  )
}
