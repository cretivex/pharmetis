import Container from '../ui/Container'
import { ShieldCheck, Building2, Award, FileText, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

function B2BComplianceSection() {
  const trustSignals = [
    {
      Icon: ShieldCheck,
      title: 'WHO-GMP',
      description: 'World Health Organization Good Manufacturing Practice',
      link: '/compliance',
    },
    {
      Icon: Building2,
      title: 'FDA Approved',
      description: 'US Food and Drug Administration compliance',
      link: '/compliance',
    },
    {
      Icon: Award,
      title: 'ISO Certified',
      description: 'International Organization for Standardization',
      link: '/compliance',
    },
    {
      Icon: FileText,
      title: 'Audit Trail',
      description: 'Complete documentation and compliance tracking',
      link: '/compliance',
    },
    {
      Icon: Lock,
      title: 'Escrow Payment',
      description: 'Secure payment infrastructure with escrow',
      link: '/compliance',
    },
    {
      Icon: CheckCircle2,
      title: 'Verified Suppliers',
      description: 'All suppliers undergo rigorous verification',
      link: '/compliance',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Enterprise Compliance
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Institutional-grade compliance and security for global pharmaceutical trade
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustSignals.map((signal, index) => {
            const IconComponent = signal.Icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative bg-white border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Subtle divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                  <IconComponent className="w-6 h-6 text-blue-700 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{signal.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{signal.description}</p>
                <a
                  href={signal.link}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 group-hover:gap-3 transition-all duration-200"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default B2BComplianceSection
