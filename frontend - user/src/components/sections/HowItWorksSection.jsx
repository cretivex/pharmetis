import Container from '../ui/Container'
import Button from '../ui/Button'

function HowItWorksSection() {
  const buyerSteps = [
    {
      number: '1',
      icon: '🔍',
      title: 'Search Products',
      description: 'Browse thousands of pharmaceutical products from verified global suppliers.',
    },
    {
      number: '2',
      icon: '📊',
      title: 'Compare Suppliers',
      description: 'Review certifications, compliance status, and supplier ratings.',
    },
    {
      number: '3',
      icon: '✉️',
      title: 'Send Enquiry',
      description: 'Connect directly with manufacturers and request quotes.',
    },
  ]

  const supplierSteps = [
    {
      number: '1',
      icon: '🏢',
      title: 'Create Company Profile',
      description: 'Register your company and upload GMP certifications.',
    },
    {
      number: '2',
      icon: '☁️',
      title: 'Upload Products',
      description: 'Add your product catalog with specifications and documentation.',
    },
    {
      number: '3',
      icon: '🌍',
      title: 'Receive Global Enquiries',
      description: 'Get connected with verified buyers from around the world.',
    },
  ]

  return (
    <section className="py-24 bg-blue-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Simple, secure, and compliant pharmaceutical sourcing process.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Buyers */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium mb-6">
              <span>🛒</span>
              <span>For Buyers</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8 tracking-tight">
              Start Sourcing Pharmaceuticals
            </h3>
            <div className="space-y-6 mb-8">
              {buyerSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Register as Buyer
            </Button>
          </div>

          {/* For Suppliers */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium mb-6">
              <span>🏢</span>
              <span>For Suppliers</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8 tracking-tight">
              Expand Your Global Reach
            </h3>
            <div className="space-y-6 mb-8">
              {supplierSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Register as Supplier
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default HowItWorksSection
