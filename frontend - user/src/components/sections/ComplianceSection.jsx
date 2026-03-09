import { motion } from 'framer-motion'
import Container from '../ui/Container'
import { Shield, Building2, Lock } from 'lucide-react'

function ComplianceSection() {
  const capabilities = [
    {
      title: 'Automated Regulatory Screening',
      description: 'AI-powered compliance engine validates every transaction against 150+ country-specific regulations, ensuring zero regulatory violations.',
      Icon: Shield,
    },
    {
      title: 'Pre-Qualified Manufacturer Network',
      description: 'Access 2,000+ GMP-certified manufacturers with verified audit trails, quality certifications, and real-time compliance status.',
      Icon: Building2,
    },
    {
      title: 'Secure Payment Infrastructure',
      description: 'Multi-currency escrow system with LC integration, milestone-based releases, and complete audit transparency for risk-free transactions.',
      Icon: Lock,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100 relative overflow-hidden">
      {/* Soft radial background glow behind section title */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      <Container>
        <motion.div
          className="text-center mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
        >
          <div className="text-sm text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mb-6 font-medium">
            VERIFIED & COMPLIANT
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Enterprise-Grade Compliance Infrastructure
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Built for global pharmaceutical trade with uncompromising regulatory standards
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {capabilities.map((capability, index) => {
            const IconComponent = capability.Icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative bg-white border border-blue-100 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={capability.title}
              >
                {/* Hover glow border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/20 via-blue-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-blue-700" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-tight">{capability.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}

export default ComplianceSection
