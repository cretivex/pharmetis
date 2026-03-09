import Container from '../ui/Container'
import { Globe, Building2, Zap, ShieldCheck, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

function B2BMetricsSection() {
  const capabilities = [
    {
      Icon: Globe,
      title: 'Growing Global Network',
      description: 'Expanding reach across international markets',
    },
    {
      Icon: Building2,
      title: 'Expanding Supplier Base',
      description: 'Continuously adding verified manufacturers',
    },
    {
      Icon: Zap,
      title: 'Rapid RFQ Response',
      description: 'Quick turnaround on quotation requests',
    },
    {
      Icon: ShieldCheck,
      title: 'Compliance-Focused Trade',
      description: 'Regulatory adherence at every step',
    },
    {
      Icon: Lock,
      title: 'Secure Escrow Support',
      description: 'Protected transactions for all parties',
    },
  ]

  return (
    <section className="py-20 bg-white border-t border-blue-100">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Platform Capabilities
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Built for enterprise pharmaceutical trade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {capabilities.map((capability, index) => {
            const IconComponent = capability.Icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-blue-700" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{capability.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{capability.description}</p>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default B2BMetricsSection
