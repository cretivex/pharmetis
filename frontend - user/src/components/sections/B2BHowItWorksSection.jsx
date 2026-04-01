import Container from '../ui/Container'
import { Search, FileText, ShieldCheck, CheckCircle } from 'lucide-react'

function B2BHowItWorksSection() {
  const steps = [
    {
      Icon: Search,
      title: 'Search & Shortlist',
      description: 'Find products and suppliers that match your requirements',
    },
    {
      Icon: FileText,
      title: 'Send RFQ',
      description: 'Submit detailed request for quotation with specifications',
    },
    {
      Icon: ShieldCheck,
      title: 'Admin Verification',
      description: 'Our team verifies compliance and connects verified parties',
    },
    {
      Icon: CheckCircle,
      title: 'Connect & Close Deal',
      description: 'Secure transaction with escrow and complete documentation',
    },
  ]

  return (
    <section className="py-20 bg-blue-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Simple, secure B2B sourcing process with complete compliance verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.Icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-lg">
                  <IconComponent className="w-8 h-8 text-blue-700" strokeWidth={2} />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-2">{index + 1}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default B2BHowItWorksSection
