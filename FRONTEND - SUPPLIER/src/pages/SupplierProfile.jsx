import { useState, useEffect, useRef } from 'react'
import { 
  Building2, Mail, Phone, MapPin, FileText, CheckCircle2, Clock, XCircle, 
  AlertCircle, RefreshCw, Globe, Package, FileCheck, Award, Calendar,
  Users, Shield, ExternalLink, Edit2, Save, X, Upload, Image as ImageIcon,
  ChevronDown, ChevronUp, FileUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getCurrentSupplier } from '@/services/auth.service'
import api from '@/services/api.js'
import { Loader2 } from 'lucide-react'

export default function SupplierProfile() {
  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState(null)
  const [error, setError] = useState(null)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    contact: true,
    address: true,
    documents: true,
    status: true
  })
  const logoInputRef = useRef(null)
  const gstInputRef = useRef(null)
  const licenseInputRef = useRef(null)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (supplier && isEditing) {
      setFormData({
        companyName: supplier.companyName || '',
        description: supplier.description || '',
        therapeutics: supplier.therapeutics || '',
        manufacturer: supplier.manufacturer || '',
        website: supplier.website || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
        yearsInBusiness: supplier.yearsInBusiness || '',
        logo: supplier.logo || '',
        gstNumber: supplier.gstNumber || '',
        licenseNumber: supplier.licenseNumber || ''
      })
    }
  }, [supplier, isEditing])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      setRefreshSuccess(false)
      const data = await getCurrentSupplier()
      console.log('[SupplierProfile] Loaded data:', data)
      setSupplier(data?.supplier || data || null)
      setRefreshSuccess(true)
      setTimeout(() => setRefreshSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to load profile:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load profile. Please try again.'
      setError(errorMessage)
      setSupplier(null)
      setRefreshSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (file, type) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // For now, we'll use a simple approach - convert to base64 or URL
      // In production, you'd upload to cloud storage
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'logo') {
          handleInputChange('logo', reader.result)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File upload error:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Prepare update data
      const updateData = {
        ...formData,
        yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null
      }

      // Remove empty fields and fields not in schema
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key]
        }
      })

      // Remove gstNumber and licenseNumber as they're not in Supplier model
      delete updateData.gstNumber
      delete updateData.licenseNumber

      const response = await api.patch('/suppliers/me', updateData)
      
      if (response.data?.success) {
        setSupplier(response.data.data)
        setIsEditing(false)
        setRefreshSuccess(true)
        setTimeout(() => setRefreshSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save profile. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
    setError(null)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getStatusBadge = (isVerified, isActive) => {
    if (isVerified === undefined || isVerified === null) {
      return <Badge variant="warning">Pending Approval</Badge>
    }
    if (!isVerified) {
      return <Badge variant="warning">Pending Approval</Badge>
    }
    if (isActive === true) {
      return <Badge variant="success">Active</Badge>
    }
    return <Badge variant="destructive">Inactive</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !supplier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Your company information and status</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Failed to Load Profile</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button onClick={loadProfile} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Your company information and status</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No Profile Found</p>
              <p className="text-sm text-gray-600 mb-4">Your supplier profile has not been created yet.</p>
              <Button onClick={loadProfile} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = {
    products: supplier._count?.products || 0,
    rfqResponses: supplier._count?.rfqResponses || 0,
    certifications: supplier.certifications?.length || 0,
    yearsInBusiness: supplier.yearsInBusiness || 0
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your company information and track your performance</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={loadProfile} 
                variant="outline" 
                size="sm"
                disabled={loading}
                className={refreshSuccess ? 'border-green-500 bg-green-50 text-green-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {refreshSuccess ? 'Refreshed!' : loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                onClick={() => setIsEditing(true)} 
                size="sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {error && isEditing && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Card with Company Info */}
      <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo/Icon Section */}
            <div className="flex-shrink-0">
              {isEditing ? (
                <div className="space-y-2">
                  {formData.logo ? (
                    <img 
                      src={formData.logo} 
                      alt="Company Logo" 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'logo')
                    }}
                  />
                  {formData.logo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('logo', '')}
                      className="w-full text-red-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {supplier.logo ? (
                    <img 
                      src={supplier.logo} 
                      alt={supplier.companyName || 'Company Logo'} 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Company Name"
                      className="text-2xl font-bold mb-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {supplier.companyName || 'Company Name'}
                    </h2>
                  )}
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Company description..."
                      className="text-sm min-h-[60px]"
                      rows={2}
                    />
                  ) : (
                    supplier.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{supplier.description}</p>
                    )
                  )}
                </div>
                {!isEditing && getStatusBadge(supplier?.isVerified, supplier?.isActive)}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {supplier.user?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{supplier.user.email}</span>
                  </div>
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone"
                      className="flex-1"
                    />
                  </div>
                ) : (
                  supplier.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{supplier.phone}</span>
                    </div>
                  )
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Website URL"
                      className="flex-1"
                    />
                  </div>
                ) : (
                  supplier.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">RFQ Responses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rfqResponses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Certifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certifications}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Years in Business</p>
                <p className="text-2xl font-bold text-gray-900">{stats.yearsInBusiness || 'N/A'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details Card - Collapsible */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('company')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>Company Information</CardTitle>
                </div>
                {expandedSections.company ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription>Your company's detailed information and business details</CardDescription>
            </CardHeader>
            {expandedSections.company && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.companyName || ''}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Company Name"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-900">{supplier.companyName || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Years in Business</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.yearsInBusiness || ''}
                        onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                        placeholder="Years"
                        min="0"
                        max="200"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-900">
                        {supplier.yearsInBusiness ? `${supplier.yearsInBusiness} years` : 'N/A'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>About Company</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your company..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {supplier.description || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                    />
                  ) : (
                    supplier.website ? (
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2 text-sm font-medium"
                      >
                        {supplier.website}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">No website provided</p>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Therapeutic Areas</Label>
                    {isEditing ? (
                      <Input
                        value={formData.therapeutics || ''}
                        onChange={(e) => handleInputChange('therapeutics', e.target.value)}
                        placeholder="e.g., Cardiovascular, Oncology, Diabetes"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {supplier.therapeutics || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    {isEditing ? (
                      <Input
                        value={formData.manufacturer || ''}
                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                        placeholder="Manufacturer name"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {supplier.manufacturer || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Contact Information Card - Collapsible */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('contact')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Information</CardTitle>
                </div>
                {expandedSections.contact ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription>How buyers can reach your company</CardDescription>
            </CardHeader>
            {expandedSections.contact && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supplier.user?.email && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</Label>
                        <p className="text-sm font-semibold text-gray-900 break-all">{supplier.user.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{supplier.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Address Card - Collapsible */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('address')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Business Address</CardTitle>
                </div>
                {expandedSections.address ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription>Your company's physical location</CardDescription>
            </CardHeader>
            {expandedSections.address && (
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    {isEditing ? (
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {supplier.address || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      {isEditing ? (
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{supplier.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      {isEditing ? (
                        <Input
                          value={formData.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Country"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{supplier.country || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column - Status & Documents */}
        <div className="space-y-6">
          {/* Approval Status Card - Collapsible */}
          <Card className="border-2">
            <CardHeader 
              className="bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => toggleSection('status')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Account Status</CardTitle>
                </div>
                {expandedSections.status ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            {expandedSections.status && (
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verification Status</p>
                    {supplier?.isVerified ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <Badge variant="success">Verified</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <Badge variant="warning">Pending Review</Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Account Status</p>
                    {supplier?.isActive ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <Badge variant="success">Active</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <Badge variant="destructive">Inactive</Badge>
                      </div>
                    )}
                  </div>
                </div>
                {!supplier?.isVerified && (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        Your registration is under review. You'll be notified via email once approved.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Document Status Card - Collapsible */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('documents')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Document Status</CardTitle>
                </div>
                {expandedSections.documents ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription>Required documents and certifications</CardDescription>
            </CardHeader>
            {expandedSections.documents && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">GST Certificate</span>
                    </div>
                    {supplier.gstNumber ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Verified</span>
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">License</span>
                    </div>
                    {supplier.licenseNumber ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Verified</span>
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>


                {!isEditing && supplier.gstNumber && (
                  <div className="pt-3 mt-3 border-t space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">GST Number</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded">
                        {supplier.gstNumber}
                      </p>
                    </div>
                  </div>
                )}

                {!isEditing && supplier.licenseNumber && (
                  <div className="pt-3 mt-3 border-t space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">License Number</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded">
                        {supplier.licenseNumber}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Certifications Card */}
          {supplier.certifications && supplier.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </CardTitle>
                <CardDescription>Your company certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supplier.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-700">{cert.name || `Certification ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
