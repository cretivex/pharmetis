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
import {
  getSupplierProfile,
  updateSupplierProfile,
  uploadSupplierLogo,
  uploadSupplierDocument
} from '@/services/supplier.service.js'
import { Loader2 } from 'lucide-react'

const resolveImageUrl = (source) => {
  const raw = String(source || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:image/')) {
    return raw
  }
  return ''
}

export default function SupplierProfile() {
  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState(null)
  const [error, setError] = useState(null)
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)
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
      const supplierLogo = resolveImageUrl(supplier.logo_url || supplier.logo)
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
        logo: supplierLogo,
        logo_url: supplierLogo,
        gstNumber: supplier.gstNumber || '',
        licenseNumber: supplier.licenseNumber || '',
        certifications: (supplier.certifications || []).map((c) => ({
          type: c.type || '',
          number: c.number || '',
          issuedBy: c.issuedBy || '',
          document: c.document || '',
          issuedDate: c.issuedDate ? String(c.issuedDate).slice(0, 10) : '',
          expiryDate: c.expiryDate ? String(c.expiryDate).slice(0, 10) : ''
        }))
      })
    }
  }, [supplier, isEditing])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      setRefreshSuccess(false)
      const data = await getSupplierProfile()
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
      const uploadedUrl = await uploadSupplierLogo(file)
      if (type === 'logo' && uploadedUrl) {
        handleInputChange('logo', uploadedUrl)
        handleInputChange('logo_url', uploadedUrl)
        setLogoLoadFailed(false)
      }
    } catch (error) {
      console.error('File upload error:', error)
      setError(error.response?.data?.message || error.message || 'Failed to upload file')
    }
  }

  const updateCertRow = (index, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.certifications || [])]
      list[index] = { ...list[index], [field]: value }
      return { ...prev, certifications: list }
    })
  }

  const addCertificationRow = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          type: '',
          number: '',
          issuedBy: '',
          document: '',
          issuedDate: '',
          expiryDate: ''
        }
      ]
    }))
  }

  const removeCertificationRow = (index) => {
    setFormData((prev) => {
      const list = [...(prev.certifications || [])]
      list.splice(index, 1)
      return { ...prev, certifications: list }
    })
  }

  const handleCertDocumentUpload = async (index, file) => {
    try {
      setError(null)
      const url = await uploadSupplierDocument(file)
      if (url) updateCertRow(index, 'document', url)
    } catch (error) {
      console.error('Document upload error:', error)
      setError(error.response?.data?.message || error.message || 'Failed to upload document')
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

      if (updateData.logo || updateData.logo_url) {
        const normalizedLogo = resolveImageUrl(updateData.logo_url || updateData.logo)
        updateData.logo = normalizedLogo || null
        updateData.logo_url = normalizedLogo || null
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

      const certs = Array.isArray(formData.certifications) ? formData.certifications : []
      updateData.certifications = certs
        .filter((c) => c.type && String(c.type).trim())
        .map((c) => ({
          type: String(c.type).trim(),
          number: c.number ? String(c.number).trim() : null,
          issuedBy: c.issuedBy ? String(c.issuedBy).trim() : null,
          document: c.document ? String(c.document).trim() : null,
          issuedDate: c.issuedDate ? new Date(c.issuedDate).toISOString() : null,
          expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString() : null
        }))

      const response = await updateSupplierProfile(updateData)
      
      if (response?.success) {
        setSupplier(response.data)
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
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your company information and status</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
              <p className="mb-2 text-lg font-medium text-foreground">Failed to load profile</p>
              <p className="mb-4 text-sm text-muted-foreground">{error}</p>
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
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your company information and status</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium text-foreground">No profile found</p>
              <p className="mb-4 text-sm text-muted-foreground">Your supplier profile has not been created yet.</p>
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
  const displayLogo = resolveImageUrl((isEditing ? formData.logo_url || formData.logo : supplier.logo_url || supplier.logo))

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Company profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your company information and track performance
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
                className={
                  refreshSuccess
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : ''
                }
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {refreshSuccess ? 'Updated' : loading ? 'Refreshing…' : 'Refresh'}
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
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Card with Company Info */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card dark:from-primary/15 dark:via-card dark:to-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo/Icon Section */}
            <div className="flex-shrink-0">
              {isEditing ? (
                <div className="space-y-2">
                  {displayLogo && !logoLoadFailed ? (
                    <img 
                      src={displayLogo}
                      alt="Company Logo" 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20 shadow-md"
                      onError={() => setLogoLoadFailed(true)}
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
                      className="w-full text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {displayLogo && !logoLoadFailed ? (
                    <img 
                      src={displayLogo}
                      alt={supplier.companyName || 'Company Logo'} 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20 shadow-md"
                      onError={() => setLogoLoadFailed(true)}
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
                    <h2 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
                      {supplier.companyName || 'Company Name'}
                    </h2>
                  )}
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Company description..."
                      className="min-h-[60px] text-sm"
                      rows={2}
                    />
                  ) : (
                    supplier.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{supplier.description}</p>
                    )
                  )}
                </div>
                {!isEditing && getStatusBadge(supplier?.isVerified, supplier?.isActive)}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {supplier.user?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground/90">{supplier.user.email}</span>
                  </div>
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-foreground/90">{supplier.phone}</span>
                    </div>
                  )
                )}
                {isEditing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-primary hover:underline"
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Total products</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{stats.products}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
                <Package className="h-6 w-6" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-muted-foreground">RFQ responses</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{stats.rfqResponses}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
                <FileCheck className="h-6 w-6" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Certifications</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{stats.certifications}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300">
                <Award className="h-6 w-6" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-muted-foreground">Years in business</p>
                <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {stats.yearsInBusiness || '—'}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
                <Calendar className="h-6 w-6" aria-hidden />
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
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('company')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>Company Information</CardTitle>
                </div>
                {expandedSections.company ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
                      <p className="text-base font-semibold text-foreground">{supplier.companyName || 'N/A'}</p>
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
                      <p className="text-base font-semibold text-foreground">
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
                    <p className="text-sm leading-relaxed text-foreground/90">
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
                      <p className="text-sm text-muted-foreground">No website provided</p>
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
                      <p className="text-sm font-semibold text-foreground">
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
                      <p className="text-sm font-semibold text-foreground">
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
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('contact')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Contact Information</CardTitle>
                </div>
                {expandedSections.contact ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <CardDescription>How buyers can reach your company</CardDescription>
            </CardHeader>
            {expandedSections.contact && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supplier.user?.email && (
                    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 dark:bg-muted/25">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
                        <Mail className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Email address
                        </Label>
                        <p className="break-all text-sm font-semibold text-foreground">{supplier.user.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 dark:bg-muted/25">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
                      <Phone className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone number
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{supplier.phone || 'Not provided'}</p>
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
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('address')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Business Address</CardTitle>
                </div>
                {expandedSections.address ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
                      <p className="text-sm font-semibold text-foreground">
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
                        <p className="text-sm text-foreground">{supplier.city || 'Not provided'}</p>
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
                        <p className="text-sm text-foreground">{supplier.country || 'Not provided'}</p>
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
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {expandedSections.status && (
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Verification status
                    </p>
                    {supplier?.isVerified ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" aria-hidden />
                        <Badge variant="success">Verified</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" aria-hidden />
                        <Badge variant="warning">Pending Review</Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Account status
                    </p>
                    {supplier?.isActive ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" aria-hidden />
                        <Badge variant="success">Active</Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" aria-hidden />
                        <Badge variant="destructive">Inactive</Badge>
                      </div>
                    )}
                  </div>
                </div>
                {supplier?.isVerified ? (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 dark:bg-emerald-500/15">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
                      <p className="text-xs text-emerald-950 dark:text-emerald-100">
                        Email verification is complete and your supplier profile is marked verified for the marketplace.
                        List products so buyers can find you in search.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 dark:bg-amber-500/15">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
                      <p className="text-xs text-amber-950 dark:text-amber-100">
                        Not verified yet. Complete the OTP sent to your email during registration, then sign in again.
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
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('documents')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Document Status</CardTitle>
                </div>
                {expandedSections.documents ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <CardDescription>Required documents and certifications</CardDescription>
            </CardHeader>
            {expandedSections.documents && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3 dark:bg-muted/25">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-medium text-foreground">GST certificate</span>
                    </div>
                    {supplier.gstNumber ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" aria-hidden />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Verified</span>
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3 dark:bg-muted/25">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" aria-hidden />
                      <span className="text-sm font-medium text-foreground">License</span>
                    </div>
                    {supplier.licenseNumber ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" aria-hidden />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Verified</span>
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                </div>


                {!isEditing && supplier.gstNumber && (
                  <div className="pt-3 mt-3 border-t space-y-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        GST number
                      </p>
                      <p className="rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm font-semibold text-foreground">
                        {supplier.gstNumber}
                      </p>
                    </div>
                  </div>
                )}

                {!isEditing && supplier.licenseNumber && (
                  <div className="pt-3 mt-3 border-t space-y-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        License number
                      </p>
                      <p className="rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-sm font-semibold text-foreground">
                        {supplier.licenseNumber}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Certifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certifications
              </CardTitle>
              <CardDescription>
                Upload compliance documents (PDF, Office). Saved when you save profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {(formData.certifications || []).map((cert, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4 dark:bg-muted/20"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`cert-type-${index}`}>Type / name</Label>
                          <Input
                            id={`cert-type-${index}`}
                            value={cert.type}
                            onChange={(e) => updateCertRow(index, 'type', e.target.value)}
                            placeholder="e.g. WHO-GMP, ISO 9001"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`cert-num-${index}`}>Certificate number</Label>
                          <Input
                            id={`cert-num-${index}`}
                            value={cert.number}
                            onChange={(e) => updateCertRow(index, 'number', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor={`cert-file-${index}`}>Document file</Label>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <input
                              id={`cert-file-${index}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf"
                              className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleCertDocumentUpload(index, f)
                                e.target.value = ''
                              }}
                            />
                            {cert.document ? (
                              <a
                                href={cert.document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                View file
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertificationRow(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" size="sm" onClick={addCertificationRow}>
                    Add certification
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  {supplier.certifications && supplier.certifications.length > 0 ? (
                    supplier.certifications.map((cert, index) => (
                      <div
                        key={cert.id || index}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/40 p-3 dark:bg-muted/25"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                          <span className="text-sm font-medium text-foreground truncate">
                            {cert.type || `Certification ${index + 1}`}
                          </span>
                        </div>
                        {cert.document ? (
                          <a
                            href={cert.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            Document
                          </a>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications on file. Edit profile to add.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
