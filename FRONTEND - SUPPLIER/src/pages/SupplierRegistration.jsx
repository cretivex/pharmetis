import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  FileText, 
  User, 
  MapPin, 
  Upload, 
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { registerSupplier } from '@/services/auth.service'
import { bulkUploadProducts } from '@/services/products.service'

const steps = [
  { id: 1, title: 'Company Details', icon: Building2 },
  { id: 2, title: 'GST & License', icon: FileText },
  { id: 3, title: 'Contact Person', icon: User },
  { id: 4, title: 'Address', icon: MapPin },
  { id: 5, title: 'Documents', icon: Upload },
  { id: 6, title: 'Products', icon: FileSpreadsheet },
  { id: 7, title: 'Review', icon: CheckCircle2 },
]

export default function SupplierRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [draftSaved, setDraftSaved] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Company Details
    companyName: '',
    website: '',
    yearsInBusiness: '',
    description: '',
    therapeutics: '',
    manufacturer: '',
    password: '',
    
    // Step 2: GST & License
    gstNumber: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiry: '',
    
    // Step 3: Contact Person
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactDesignation: '',
    
    // Step 4: Address
    country: '',
    city: '',
    address: '',
    postalCode: '',
    
    // Step 5: Documents
    documents: [],
    
    // Step 6: Products
    productFile: null,
  })

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setDraftSaved(false)
  }

  const handleFileChange = (field, files) => {
    updateFormData(field, Array.from(files))
  }

  const handleProductFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      updateFormData('productFile', file)
    }
  }

  const saveDraft = () => {
    localStorage.setItem('supplierRegistrationDraft', JSON.stringify(formData))
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('supplierRegistrationDraft')
    if (draft) {
      setFormData(JSON.parse(draft))
    }
  }

  useEffect(() => {
    loadDraft()
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields before submission
      if (!formData.contactEmail || formData.contactEmail.trim() === '') {
        setError('Email is required')
        setSubmitting(false)
        return
      }

      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        setSubmitting(false)
        return
      }

      if (!formData.companyName || formData.companyName.trim() === '') {
        setError('Company name is required')
        setSubmitting(false)
        return
      }

      if (!formData.country || formData.country.trim() === '') {
        setError('Country is required')
        setSubmitting(false)
        return
      }

      // Build registration payload - ensure email field matches backend expectation
      // Normalize email: lowercase and trim (matches backend normalization)
      const registrationData = {
        email: formData.contactEmail.toLowerCase().trim(), // Backend expects 'email' field
        password: formData.password,
        companyName: formData.companyName.trim(),
        country: formData.country.trim(),
        // Optional fields - only include if they have values
        ...(formData.website && formData.website.trim() && { 
          website: (() => {
            const url = formData.website.trim();
            // Auto-add https:// if missing protocol
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
              return `https://${url}`;
            }
            return url;
          })()
        }),
        ...(formData.yearsInBusiness && { yearsInBusiness: parseInt(formData.yearsInBusiness) || 0 }),
        ...(formData.description && formData.description.trim() && { description: formData.description.trim() }),
        ...(formData.therapeutics && formData.therapeutics.trim() && { therapeutics: formData.therapeutics.trim() }),
        ...(formData.manufacturer && formData.manufacturer.trim() && { manufacturer: formData.manufacturer.trim() }),
        ...(formData.city && formData.city.trim() && { city: formData.city.trim() }),
        ...(formData.address && formData.address.trim() && { address: formData.address.trim() }),
        ...(formData.postalCode && formData.postalCode.trim() && { postalCode: formData.postalCode.trim() }),
        ...(formData.contactPhone && formData.contactPhone.trim() && { 
          phone: formData.contactPhone.trim(),
          contactPhone: formData.contactPhone.trim()
        }),
        ...(formData.contactEmail && formData.contactEmail.trim() && { contactEmail: formData.contactEmail.trim() }),
        ...(formData.contactName && formData.contactName.trim() && { contactName: formData.contactName.trim() }),
        ...(formData.contactDesignation && formData.contactDesignation.trim() && { contactDesignation: formData.contactDesignation.trim() }),
        ...(formData.gstNumber && formData.gstNumber.trim() && { gstNumber: formData.gstNumber.trim() }),
        ...(formData.licenseNumber && formData.licenseNumber.trim() && { licenseNumber: formData.licenseNumber.trim() }),
        ...(formData.licenseType && formData.licenseType.trim() && { licenseType: formData.licenseType.trim() }),
        ...(formData.licenseExpiry && formData.licenseExpiry.trim() !== '' && { licenseExpiry: formData.licenseExpiry }),
      }

      // Log payload for debugging (remove in production)
      console.log('[SupplierRegistration] Sending payload:', registrationData)

      const result = await registerSupplier(registrationData)
      
      // Redirect to OTP verification page with email
      navigate('/supplier/verify-otp', { 
        state: { 
          email: registrationData.email,
          message: 'Registration successful. Please verify your email with the OTP code sent to your inbox.'
        } 
      })
    } catch (err) {
      // Improved error handling - show specific backend validation messages
      const errorMessage = err.response?.data?.message || 
                          (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
                          err.message || 
                          'Registration failed. Please check all required fields.'
      setError(errorMessage)
      console.error('[SupplierRegistration] Registration error:', err.response?.data || err)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100
  const CurrentIcon = steps[currentStep - 1]?.icon || Building2

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supplier Registration</h1>
          <p className="mt-2 text-sm text-gray-600">Complete all steps to register your company</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CurrentIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Step {currentStep}: {steps[currentStep - 1]?.title}</CardTitle>
                  <CardDescription>Progress: {currentStep} of {steps.length}</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={saveDraft}>
                <Save className="h-4 w-4 mr-2" />
                {draftSaved ? 'Saved!' : 'Save Draft'}
              </Button>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Brief description of your company"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="therapeutics">Therapeutic Areas</Label>
                  <Input
                    id="therapeutics"
                    value={formData.therapeutics}
                    onChange={(e) => updateFormData('therapeutics', e.target.value)}
                    placeholder="e.g., Cardiovascular, Oncology, Diabetes"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer Name</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => updateFormData('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer name"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: GST & License */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number *</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => updateFormData('gstNumber', e.target.value)}
                    placeholder="GSTIN"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                    placeholder="License number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licenseType">License Type</Label>
                  <Input
                    id="licenseType"
                    value={formData.licenseType}
                    onChange={(e) => updateFormData('licenseType', e.target.value)}
                    placeholder="e.g., WHO-GMP, FDA"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateFormData('licenseExpiry', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Contact Person */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData('contactPhone', e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactDesignation">Designation</Label>
                  <Input
                    id="contactDesignation"
                    value={formData.contactDesignation}
                    onChange={(e) => updateFormData('contactDesignation', e.target.value)}
                    placeholder="e.g., Sales Manager"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Address */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    placeholder="Country"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Street address"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label>Upload Documents</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('documents', e.target.files)}
                      className="hidden"
                      id="documents"
                    />
                    <label
                      htmlFor="documents"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                      </span>
                    </label>
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Array.from(formData.documents).map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Products */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <Label>Upload Products (Excel/CSV)</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleProductFileChange}
                      className="hidden"
                      id="productFile"
                    />
                    <label
                      htmlFor="productFile"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FileSpreadsheet className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload Excel or CSV file
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Download sample template first
                      </span>
                    </label>
                  </div>
                  {formData.productFile && (
                    <div className="mt-4 text-sm text-gray-600">
                      {formData.productFile.name} ({(formData.productFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      // Download template logic
                      const link = document.createElement('a')
                      link.href = '/product-template.csv'
                      link.download = 'product-template.csv'
                      link.click()
                    }}
                  >
                    Download Sample Template
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Company Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Company Name:</span>
                      <p className="font-medium">{formData.companyName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <p className="font-medium">{formData.website || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Contact Person:</span>
                      <p className="font-medium">{formData.contactName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{formData.contactEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Address</h3>
                  <div className="text-sm">
                    <p className="font-medium">{formData.address}</p>
                    <p className="text-gray-600">{formData.city}, {formData.country}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Review
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
