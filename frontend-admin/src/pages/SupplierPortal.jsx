import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Building2, Upload, FileText, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import FileUpload from '@/components/FileUpload'

const steps = [
  { id: 1, title: 'Company Details', icon: Building2 },
  { id: 2, title: 'Upload Products', icon: Upload },
  { id: 3, title: 'Review & Submit', icon: FileText },
]

export default function SupplierPortal() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    website: '',
    description: '',
    yearsInBusiness: '',
    certifications: '',
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (files) => {
    setUploadedFiles(files)
  }

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
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 2000)
  }

  const progress = (currentStep / steps.length) * 100

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card text-center">
            <CardContent className="pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your supplier registration has been submitted successfully. Our team will review your application and get back to you soon.
              </p>
              <Button
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(1)
                  setFormData({})
                  setUploadedFiles([])
                }}
                className="w-full"
              >
                Submit Another Registration
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep >= step.id
                const isCurrent = currentStep === step.id
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className={`text-xs mt-2 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Please provide your company details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        id="country"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="DE">Germany</option>
                        <option value="CN">China</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsInBusiness">Years in Business</Label>
                      <Input
                        id="yearsInBusiness"
                        type="number"
                        value={formData.yearsInBusiness}
                        onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                      <Input
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => updateFormData('certifications', e.target.value)}
                        placeholder="WHO-GMP, FDA, ISO"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={nextStep}>
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Upload Product Catalog</CardTitle>
                  <CardDescription>Upload your product list in Excel or CSV format</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileSelect={handleFileSelect} />
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextStep} disabled={uploadedFiles.length === 0}>
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>Please review your information before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Company Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company Name:</span>
                        <span>{formData.companyName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{formData.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{formData.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{formData.city && formData.country ? `${formData.city}, ${formData.country}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Uploaded Files</h3>
                    <div className="space-y-2">
                      {uploadedFiles.length > 0 ? (
                        uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                            <FileText className="w-4 h-4" />
                            <span>{file.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No files uploaded</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Registration'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
