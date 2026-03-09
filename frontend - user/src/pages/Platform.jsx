import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Platform() {
  const platformFeatures = [
    {
      title: 'RFQ Management',
      description: 'Structured RFQ submission and response system with automated supplier matching.',
      icon: '📋',
    },
    {
      title: 'Quote Comparison',
      description: 'Compare quotes from multiple suppliers side-by-side with detailed breakdowns.',
      icon: '📊',
    },
    {
      title: 'Order Tracking',
      description: 'Real-time tracking from manufacturing through shipment to delivery.',
      icon: '📍',
    },
    {
      title: 'Payment Processing',
      description: 'Secure multi-currency escrow with milestone-based payment releases.',
      icon: '💳',
    },
    {
      title: 'Document Management',
      description: 'Centralized repository for all transaction documents and compliance certificates.',
      icon: '📁',
    },
    {
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics dashboard with performance metrics and insights.',
      icon: '📈',
    },
  ]

  const pricingTiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small buyers',
      features: [
        '5 RFQs per month',
        'Basic supplier search',
        'Email support',
        'Standard compliance checks',
      ],
    },
    {
      name: 'Professional',
      price: '$499/mo',
      description: 'For growing businesses',
      features: [
        'Unlimited RFQs',
        'Advanced search filters',
        'Priority support',
        'Enhanced compliance tools',
        'Analytics dashboard',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees',
        'White-label options',
      ],
    },
  ]

  return (
    <div className="pt-32 pb-20">
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Platform Features
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive B2B marketplace platform with end-to-end transaction management and compliance automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {platformFeatures.map((feature, index) => (
            <Card key={index} variant="elevated" className="p-6">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-white mb-12 text-center">
            Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                variant={tier.popular ? 'filled' : 'elevated'}
                className={`p-8 ${tier.popular ? 'border-accent border-2' : ''}`}
              >
                {tier.popular && (
                  <div className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-accent mb-2">{tier.price}</div>
                <p className="text-slate-400 mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Platform
