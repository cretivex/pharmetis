import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { reportError } from '@/utils/errorReporter'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  Building2,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Globe,
  Calendar,
  Box,
  Info,
  Shield,
  X,
  Plus,
  Upload,
  Trash2,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { getProductById, updateProduct } from '@/services/products.service'
import { getAllSuppliers } from '@/services/suppliers.service'
import api from '@/services/api.js'

const DOSAGE_FORMS = [
  { value: 'TABLET', label: 'Tablet' },
  { value: 'CAPSULE', label: 'Capsule' },
  { value: 'INJECTABLE', label: 'Injectable' },
  { value: 'SYRUP', label: 'Syrup' },
  { value: 'SUSPENSION', label: 'Suspension' },
  { value: 'CREAM', label: 'Cream' },
  { value: 'OINTMENT', label: 'Ointment' },
  { value: 'DROPS', label: 'Drops' },
  { value: 'SPRAY', label: 'Spray' },
  { value: 'OTHER', label: 'Other' }
]

const AVAILABILITY_OPTIONS = [
  { value: 'IN_STOCK', label: 'In Stock', color: 'text-emerald-400' },
  { value: 'MADE_TO_ORDER', label: 'Made to Order', color: 'text-amber-400' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock', color: 'text-red-400' }
]

export default function ProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [formData, setFormData] = useState({
    supplierId: '',
    name: '',
    brand: '',
    strength: '',
    dosageForm: 'TABLET',
    manufacturer: '',
    country: '',
    description: '',
    apiName: '',
    composition: '',
    packagingType: '',
    shelfLife: '',
    storageConditions: '',
    regulatoryApprovals: '',
    hsCode: '',
    moq: '',
    availability: 'IN_STOCK',
    price: '',
    isActive: true,
    selectedCategories: [],
    images: []
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load product, suppliers, and categories in parallel
      const [productData, suppliersData, categoriesData] = await Promise.all([
        getProductById(id),
        getAllSuppliers({ limit: 1000 }),
        api.get('/categories').then(res => res.data?.data || res.data || []).catch(() => [])
      ])

      // Set suppliers
      const suppliersList = Array.isArray(suppliersData) 
        ? suppliersData 
        : (suppliersData?.suppliers || [])
      setSuppliers(suppliersList)

      // Set categories
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])

      // Set form data from product
      if (productData) {
        const selectedCategories = productData.productCategories?.map(pc => pc.categoryId) || []
        const images = productData.images?.map(img => ({ url: img.url, alt: img.alt || productData.name })) || []

        setFormData({
          supplierId: productData.supplierId || '',
          name: productData.name || '',
          brand: productData.brand || '',
          strength: productData.strength || '',
          dosageForm: productData.dosageForm || 'TABLET',
          manufacturer: productData.manufacturer || '',
          country: productData.country || '',
          description: productData.description || '',
          apiName: productData.apiName || '',
          composition: productData.composition || '',
          packagingType: productData.packagingType || '',
          shelfLife: productData.shelfLife || '',
          storageConditions: productData.storageConditions || '',
          regulatoryApprovals: productData.regulatoryApprovals || '',
          hsCode: productData.hsCode || '',
          moq: productData.moq || '',
          availability: productData.availability || 'IN_STOCK',
          price: productData.price ? parseFloat(productData.price.toString()) : '',
          isActive: productData.isActive !== false,
          selectedCategories,
          images
        })
      }
    } catch (err) {
      reportError(err, { context: 'ProductEdit.loadData' })
      setError(err.response?.data?.message || err.message || 'Failed to load product data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId)
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(id => id !== categoryId)
          : [...prev.selectedCategories, categoryId]
      }
    })
    setSuccess(false)
  }

  const handleImageAdd = () => {
    const url = newImageUrl.trim()
    if (url) {
      // Basic URL validation
      try {
        new URL(url)
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url, alt: formData.name || 'Product image' }]
        }))
        setNewImageUrl('')
        setShowImageModal(false)
        setSuccess(false)
      } catch {
        setError('Please enter a valid URL')
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.supplierId) {
      setError('Please fill in required fields: Name and Supplier')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updatePayload = {
        name: formData.name,
        brand: formData.brand || null,
        strength: formData.strength || null,
        dosageForm: formData.dosageForm,
        manufacturer: formData.manufacturer || null,
        country: formData.country || null,
        description: formData.description || null,
        apiName: formData.apiName || null,
        composition: formData.composition || null,
        packagingType: formData.packagingType || null,
        shelfLife: formData.shelfLife || null,
        storageConditions: formData.storageConditions || null,
        regulatoryApprovals: formData.regulatoryApprovals || null,
        hsCode: formData.hsCode || null,
        moq: formData.moq || null,
        availability: formData.availability,
        price: formData.price ? parseFloat(formData.price) : null,
        isActive: formData.isActive,
        categoryIds: formData.selectedCategories,
        images: formData.images.map((img, index) => ({
          url: img.url,
          alt: img.alt || formData.name,
          order: index
        })),
        image_url: formData.images[0]?.url || null
      }

      await updateProduct(id, updatePayload)

      setSuccess(true)
      setTimeout(() => {
        navigate('/products')
      }, 1500)
    } catch (err) {
      reportError(err, { context: 'ProductEdit.updateProduct' })
      setError(err.response?.data?.message || err.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <div className="text-muted-foreground">Loading product...</div>
        </div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div className="text-red-400 text-lg font-semibold">Error: {error}</div>
          <Button onClick={() => navigate('/products')} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <Section>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/products')}
                className="h-9 w-9 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <SectionTitle>Edit Product</SectionTitle>
                <SectionSubtitle className="text-muted-foreground">
                  Update product information and details
                </SectionSubtitle>
              </div>
            </div>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Product updated successfully!</span>
              </motion.div>
            )}
          </div>
        </Section>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-400 flex-1">{error}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-300"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    Basic Information
                  </PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-medium">
                        Product Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-xs font-medium">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Brand name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierId" className="text-xs font-medium">
                        Supplier <span className="text-red-400">*</span>
                      </Label>
                      <select
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={(e) => handleInputChange('supplierId', e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.companyName || supplier.name || supplier.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosageForm" className="text-xs font-medium">Dosage Form</Label>
                      <select
                        id="dosageForm"
                        value={formData.dosageForm}
                        onChange={(e) => handleInputChange('dosageForm', e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {DOSAGE_FORMS.map(form => (
                          <option key={form.value} value={form.value}>{form.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strength" className="text-xs font-medium">Strength</Label>
                      <Input
                        id="strength"
                        value={formData.strength}
                        onChange={(e) => handleInputChange('strength', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer" className="text-xs font-medium">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Manufacturer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-xs font-medium">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Country of origin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiName" className="text-xs font-medium">API Name</Label>
                      <Input
                        id="apiName"
                        value={formData.apiName}
                        onChange={(e) => handleInputChange('apiName', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Active Pharmaceutical Ingredient"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="composition" className="text-xs font-medium">Composition</Label>
                    <Input
                      id="composition"
                      value={formData.composition}
                      onChange={(e) => handleInputChange('composition', e.target.value)}
                      className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-indigo-500 resize-none"
                      placeholder="Product description..."
                    />
                  </div>
                </PanelContent>
              </Panel>

              {/* Product Details */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    Product Details
                  </PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="packagingType" className="text-xs font-medium">Packaging Type</Label>
                      <Input
                        id="packagingType"
                        value={formData.packagingType}
                        onChange={(e) => handleInputChange('packagingType', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="e.g., Blister pack, Bottle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shelfLife" className="text-xs font-medium">Shelf Life</Label>
                      <Input
                        id="shelfLife"
                        value={formData.shelfLife}
                        onChange={(e) => handleInputChange('shelfLife', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="e.g., 24 months"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsCode" className="text-xs font-medium">HS Code</Label>
                      <Input
                        id="hsCode"
                        value={formData.hsCode}
                        onChange={(e) => handleInputChange('hsCode', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="Harmonized System Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moq" className="text-xs font-medium">MOQ (Minimum Order Quantity)</Label>
                      <Input
                        id="moq"
                        value={formData.moq}
                        onChange={(e) => handleInputChange('moq', e.target.value)}
                        className="h-10 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="e.g., 1000 units"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storageConditions" className="text-xs font-medium">Storage Conditions</Label>
                    <Textarea
                      id="storageConditions"
                      value={formData.storageConditions}
                      onChange={(e) => handleInputChange('storageConditions', e.target.value)}
                      className="min-h-[80px] bg-slate-800/50 border-slate-700 focus:border-indigo-500 resize-none"
                      placeholder="e.g., Store in a cool, dry place"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regulatoryApprovals" className="text-xs font-medium">Regulatory Approvals</Label>
                    <Textarea
                      id="regulatoryApprovals"
                      value={formData.regulatoryApprovals}
                      onChange={(e) => handleInputChange('regulatoryApprovals', e.target.value)}
                      className="min-h-[80px] bg-slate-800/50 border-slate-700 focus:border-indigo-500 resize-none"
                      placeholder="e.g., FDA, WHO-GMP, EMA"
                    />
                  </div>
                </PanelContent>
              </Panel>

              {/* Images */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Product Images
                  </PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-4">
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 bg-red-500/90 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageModal(true)}
                    className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add Image</span>
                    </div>
                  </Button>
                </PanelContent>
              </Panel>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing & Availability */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Pricing & Availability
                  </PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-medium">Price (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="h-10 pl-9 bg-slate-800/50 border-slate-700 focus:border-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-xs font-medium">Availability</Label>
                    <select
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {AVAILABILITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${AVAILABILITY_OPTIONS.find(o => o.value === formData.availability)?.color || 'text-muted-foreground'}`}
                      >
                        {AVAILABILITY_OPTIONS.find(o => o.value === formData.availability)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
                    />
                    <Label htmlFor="isActive" className="text-xs cursor-pointer flex-1">
                      Product is Active
                    </Label>
                    <Badge variant={formData.isActive ? 'success' : 'outline'} className="text-[10px]">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </PanelContent>
              </Panel>

              {/* Categories */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    Categories
                  </PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-3 max-h-[400px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No categories available
                    </div>
                  ) : (
                    categories.map(category => (
                      <div 
                        key={category.id} 
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                          formData.selectedCategories.includes(category.id)
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={formData.selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-xs cursor-pointer flex-1">
                          {category.name}
                        </Label>
                        {formData.selectedCategories.includes(category.id) && (
                          <Badge variant="success" className="text-[10px]">Selected</Badge>
                        )}
                      </div>
                    ))
                  )}
                </PanelContent>
              </Panel>

              {/* Actions */}
              <Panel className="glass-card">
                <PanelHeader>
                  <PanelTitle>Actions</PanelTitle>
                </PanelHeader>
                <PanelContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 h-10"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => navigate('/products')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </PanelContent>
              </Panel>
            </div>
          </div>
        </form>

        {/* Image URL Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Image</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowImageModal(false)
                    setNewImageUrl('')
                  }}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-800/50 border-slate-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleImageAdd()
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleImageAdd}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
                  >
                    Add Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowImageModal(false)
                      setNewImageUrl('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
