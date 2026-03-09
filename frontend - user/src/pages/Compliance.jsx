import Container from '../components/ui/Container'
import Card from '../components/ui/Card'

function Compliance() {
  const complianceFeatures = [
    {
      title: 'Automated Regulatory Screening',
      description: 'AI-powered engine validates transactions against 150+ country-specific regulations in real-time.',
      details: [
        'FDA, EMA, WHO-GMP compliance checks',
        'Country-specific import/export regulations',
        'Documentation validation',
        'Real-time compliance status updates',
      ],
    },
    {
      title: 'Document Management',
      description: 'Centralized repository for all compliance documents with automated validation.',
      details: [
        'GMP certificates',
        'Certificate of Analysis (COA)',
        'Drug Master Files (DMF)',
        'Export licenses and permits',
      ],
    },
    {
      title: 'Audit Trail',
      description: 'Complete transaction history with immutable records for regulatory compliance.',
      details: [
        'Full transaction documentation',
        'Compliance check history',
        'Document version control',
        'Regulatory audit support',
      ],
    },
    {
      title: 'Quality Assurance',
      description: 'Multi-layer verification process ensuring only compliant suppliers and products.',
      details: [
        'Supplier pre-qualification',
        'Product compliance validation',
        'Ongoing monitoring',
        'Quality metrics tracking',
      ],
    },
  ]

  const certifications = [
    'WHO-GMP',
    'FDA',
    'EMA',
    'ISO 9001',
    'ISO 13485',
    'MHRA',
    'TGA',
    'Health Canada',
  ]

  return (
    <div className="pt-32 pb-20">
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Compliance & Trust
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Enterprise-grade compliance infrastructure ensuring regulatory adherence across all transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {complianceFeatures.map((feature, index) => (
            <Card key={index} variant="elevated" className="p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-300 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start space-x-2">
                    <span className="text-accent mt-1">✓</span>
                    <span className="text-slate-400">{detail}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">
            Supported Certifications
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} variant="outlined" className="px-6 py-3">
                <span className="text-white font-medium">{cert}</span>
              </Card>
            ))}
          </div>
        </div>

        <Card variant="filled" className="p-8 bg-accent/10 border-accent/20">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">
              99.8% Compliance Rate
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our automated compliance infrastructure ensures that 99.8% of all transactions meet regulatory requirements, with zero tolerance for violations.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default Compliance
