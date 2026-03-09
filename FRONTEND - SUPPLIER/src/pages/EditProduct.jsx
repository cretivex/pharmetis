import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Save, X, Loader2, AlertCircle, CheckCircle2, Plus, Trash2, 
  Package, Info, FileText, DollarSign, Globe, Building2, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProduct } from '@/services/products.service'
import { getCurrentSupplier } from '@/services/auth.service'
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
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'MADE_TO_ORDER', label: 'Made to Order' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' }
]

export default function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState(null)
  const [imageUrls, setImageUrls] = useState([''])
  const [supplier, setSupplier] = useState(null)
  const [loadingSupplier, setLoadingSupplier] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    strength: '',
    dosageForm: 'TABLET',
    manufacturer: '',
    country: '',
    description: '',
    apiName: '',
    composition: '',
    therapeutics: '',
    packagingType: '',
    shelfLife: '',
    storageConditions: '',
    regulatoryApprovals: '',
    hsCode: '',
    moq: '',
    compareTo: '',
    ndcNumber: '',
    packSize: '',
    availability: 'IN_STOCK',
    price: '',
    categoryIds: []
  })

  useEffect(() => {
    if (id) {
      loadProduct()
      loadCategories()
      loadSupplier()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/products/${id}`)
      const product = response.data?.data || response.data
      
      if (!product) {
        setError('Product not found')
        return
      }

      // Populate form with product data
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        strength: product.strength || '',
        dosageForm: product.dosageForm || 'TABLET',
        manufacturer: product.manufacturer || '',
        country: product.country || '',
        description: product.description || '',
        apiName: product.apiName || '',
        composition: product.composition || '',
        therapeutics: product.therapeutics || '',
        packagingType: product.packagingType || '',
        shelfLife: product.shelfLife || '',
        storageConditions: product.storageConditions || '',
        regulatoryApprovals: product.regulatoryApprovals || '',
        hsCode: product.hsCode || '',
        moq: product.moq || '',
        compareTo: product.compareTo || '',
        ndcNumber: product.ndcNumber || '',
        packSize: product.packSize || '',
        availability: product.availability || 'IN_STOCK',
        price: product.price ? product.price.toString() : '',
        categoryIds: product.productCategories?.map((pc) => pc.categoryId || pc.category?.id).filter(Boolean) || []
      })

      // Set images
      if (product.images && product.images.length > 0) {
        setImageUrls(product.images.map(img => img.url))
      } else {
        setImageUrls([''])
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      setCategoryError(null)
      const response = await api.get('/categories?isActive=true')
      const categoriesList = response.data?.data || response.data || []
      setCategories(categoriesList)
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategoryError('Failed to load categories. You can still edit the product without categories.')
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadSupplier = async () => {
    try {
      setLoadingSupplier(true)
      const data = await getCurrentSupplier()
      setSupplier(data?.supplier || data || null)
    } catch (error) {
      console.error('Failed to load supplier info:', error)
    } finally {
      setLoadingSupplier(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setFormData(prev => ({ ...prev, [name]: value }))
      setError(null)
    }
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(newUrls)
    } else {
      setImageUrls([''])
    }
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const categoryIds = prev.categoryIds || []
      if (categoryIds.includes(categoryId)) {
        return { ...prev, categoryIds: categoryIds.filter(id => id !== categoryId) }
      } else {
        return { ...prev, categoryIds: [...categoryIds, categoryId] }
      }
    })
  }

  const validateImageUrls = () => {
    const invalidUrls = imageUrls.filter(url => {
      if (!url.trim()) return false
      try {
        new URL(url.trim())
        return false
      } catch {
        return true
      }
    })
    
    if (invalidUrls.length > 0) {
      return 'Please enter valid image URLs or leave them empty'
    }
    return null
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Product name is required'
    }
    if (!formData.dosageForm) {
      return 'Dosage form is required'
    }
    if (formData.price && parseFloat(formData.price) < 0) {
      return 'Price must be a positive number'
    }
    const imageError = validateImageUrls()
    if (imageError) {
      return imageError
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const images = imageUrls
        .filter(url => url.trim())
        .map((url, index) => ({
          url: url.trim(),
          alt: formData.name || 'Product image',
          order: index
        }))

      const parsedPrice = formData.price !== '' && formData.price != null ? parseFloat(formData.price) : NaN
      const validPrice = typeof parsedPrice === 'number' && !Number.isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : undefined

      // Backend PATCH only accepts: name, brand, strength, dosageForm, manufacturer, country,
      // description, apiName, composition, therapeutics, packagingType, shelfLife, storageConditions,
      // regulatoryApprovals, hsCode, moq, compareTo, ndcNumber, packSize, availability, price, isActive, categoryIds
      const submitData = {
        name: formData.name.trim(),
        dosageForm: formData.dosageForm || undefined,
        availability: formData.availability,
        price: validPrice,
        categoryIds: Array.isArray(formData.categoryIds) && formData.categoryIds.length > 0
          ? formData.categoryIds.filter((id) => id && typeof id === 'string')
          : undefined
      }

      if (formData.brand?.trim()) submitData.brand = formData.brand.trim()
      if (formData.strength?.trim()) submitData.strength = formData.strength.trim()
      if (formData.manufacturer?.trim()) submitData.manufacturer = formData.manufacturer.trim()
      if (formData.country?.trim()) submitData.country = formData.country.trim()
      if (formData.description?.trim()) submitData.description = formData.description.trim()
      if (formData.apiName?.trim()) submitData.apiName = formData.apiName.trim()
      if (formData.composition?.trim()) submitData.composition = formData.composition.trim()
      if (formData.therapeutics?.trim()) submitData.therapeutics = formData.therapeutics.trim()
      if (formData.packagingType?.trim()) submitData.packagingType = formData.packagingType.trim()
      if (formData.shelfLife?.trim()) submitData.shelfLife = formData.shelfLife.trim()
      if (formData.storageConditions?.trim()) submitData.storageConditions = formData.storageConditions.trim()
      if (formData.regulatoryApprovals?.trim()) submitData.regulatoryApprovals = formData.regulatoryApprovals.trim()
      if (formData.hsCode?.trim()) submitData.hsCode = formData.hsCode.trim()
      if (formData.moq?.trim()) submitData.moq = formData.moq.trim()
      if (formData.compareTo?.trim()) submitData.compareTo = formData.compareTo.trim()
      if (formData.ndcNumber?.trim()) submitData.ndcNumber = formData.ndcNumber.trim()
      if (formData.packSize?.trim()) submitData.packSize = formData.packSize.trim()

      await updateProduct(id, submitData)
      
      setSuccess('Product updated successfully!')
      setTimeout(() => {
        navigate('/supplier/products')
      }, 1500)
    } catch (error) {
      console.error('Failed to update product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-600 mt-1">Update product information</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/supplier/products')}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Paracetamol 500mg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Brand name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strength">Strength</Label>
                    <Input
                      id="strength"
                      name="strength"
                      value={formData.strength}
                      onChange={handleChange}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosageForm">Dosage Form *</Label>
                    <select
                      id="dosageForm"
                      name="dosageForm"
                      value={formData.dosageForm}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {DOSAGE_FORMS.map(form => (
                        <option key={form.value} value={form.value}>
                          {form.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {AVAILABILITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Product description..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Manufacturing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Manufacturing Information
                </CardTitle>
                <CardDescription>Manufacturing and origin details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Manufacturer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Origin</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="e.g., India, USA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiName">API Name</Label>
                    <Input
                      id="apiName"
                      name="apiName"
                      value={formData.apiName}
                      onChange={handleChange}
                      placeholder="Active Pharmaceutical Ingredient"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="composition">Composition</Label>
                    <Input
                      id="composition"
                      name="composition"
                      value={formData.composition}
                      onChange={handleChange}
                      placeholder="Product composition"
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="therapeutics" className="text-base font-semibold text-gray-900">
                    Product Therapeutic Areas
                  </Label>
                  <Textarea
                    id="therapeutics"
                    name="therapeutics"
                    value={formData.therapeutics}
                    onChange={handleChange}
                    placeholder="e.g., Analgesic, Antipyretic, Pain Management, Fever Reduction"
                    rows={4}
                    maxLength={500}
                    className="bg-white"
                  />
                  <p className="text-xs text-gray-600 font-medium">
                    💡 Enter the specific therapeutic areas or medical indications for THIS PRODUCT (not your company)
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.therapeutics.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Packaging & Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Packaging & Storage
                </CardTitle>
                <CardDescription>Packaging and storage details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packagingType">Packaging Type</Label>
                    <Input
                      id="packagingType"
                      name="packagingType"
                      value={formData.packagingType}
                      onChange={handleChange}
                      placeholder="e.g., Blister pack, Bottle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelfLife">Shelf Life</Label>
                    <Input
                      id="shelfLife"
                      name="shelfLife"
                      value={formData.shelfLife}
                      onChange={handleChange}
                      placeholder="e.g., 24 months"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageConditions">Storage Conditions</Label>
                  <Textarea
                    id="storageConditions"
                    name="storageConditions"
                    value={formData.storageConditions}
                    onChange={handleChange}
                    placeholder="e.g., Store in a cool, dry place"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Regulatory & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Regulatory & Compliance
                </CardTitle>
                <CardDescription>Regulatory approvals and codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsCode">HS Code</Label>
                    <Input
                      id="hsCode"
                      name="hsCode"
                      value={formData.hsCode}
                      onChange={handleChange}
                      placeholder="Harmonized System Code"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                    <Input
                      id="moq"
                      name="moq"
                      value={formData.moq}
                      onChange={handleChange}
                      placeholder="e.g., 1000 units"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatoryApprovals">Regulatory Approvals</Label>
                  <Textarea
                    id="regulatoryApprovals"
                    name="regulatoryApprovals"
                    value={formData.regulatoryApprovals}
                    onChange={handleChange}
                    placeholder="e.g., FDA approved, WHO-GMP certified"
                    rows={3}
                    maxLength={1000}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pharma identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="compareTo">Compare To</Label>
                <Input
                  id="compareTo"
                  name="compareTo"
                  value={formData.compareTo}
                  onChange={handleChange}
                  placeholder="e.g., Reference product name"
                  className="rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ndcNumber">NDC Number</Label>
                <Input
                  id="ndcNumber"
                  name="ndcNumber"
                  value={formData.ndcNumber}
                  onChange={handleChange}
                  placeholder="National Drug Code"
                  maxLength={100}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengthPharma">Strength</Label>
                <Input
                  id="strengthPharma"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  placeholder="e.g., 500mg, 10mg/ml"
                  maxLength={100}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Input
                  id="packSize"
                  name="packSize"
                  value={formData.packSize}
                  onChange={handleChange}
                  placeholder="e.g., 100 tablets, 1x10ml"
                  maxLength={100}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Product Images
                </CardTitle>
                <CardDescription>Add product image URLs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    {imageUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeImageUrl(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageUrl}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Image URL
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Categories */}
          <div className="space-y-6">
            {/* Supplier Therapeutics Info */}
            {!loadingSupplier && supplier && (
              <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Award className="h-5 w-5" />
                    Your Company Information
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    Your registered therapeutic areas and manufacturer details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supplier.therapeutics ? (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-indigo-800">Therapeutic Areas</Label>
                      <p className="text-sm text-indigo-900 font-medium">{supplier.therapeutics}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-indigo-800">Therapeutic Areas</Label>
                      <p className="text-sm text-indigo-600 italic">Not specified</p>
                    </div>
                  )}
                  {supplier.manufacturer ? (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-indigo-800">Manufacturer Name</Label>
                      <p className="text-sm text-indigo-900 font-medium">{supplier.manufacturer}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-indigo-800">Manufacturer Name</Label>
                      <p className="text-sm text-indigo-600 italic">Not specified</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing
                </CardTitle>
                <CardDescription>Product pricing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price (USD)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Leave empty if price not available</p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Categories
                </CardTitle>
                <CardDescription>Select product categories</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : categoryError ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 text-center py-2">{categoryError}</p>
                    {categories.length > 0 && (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {categories.map(category => (
                          <label
                            key={category.id}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.categoryIds?.includes(category.id) || false}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No categories available</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {categories.map(category => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoryIds?.includes(category.id) || false}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/supplier/products')}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
