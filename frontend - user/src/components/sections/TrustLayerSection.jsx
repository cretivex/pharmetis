import { motion } from 'framer-motion'
import Container from '../ui/Container'
import { ShieldCheck, Building2, Award, FileText, FileSearch, CheckCircle2 } from 'lucide-react'

function TrustLayerSection() {
  const certifications = [
    {
      name: 'WHO-GMP',
      Icon: ShieldCheck,
      description: 'World Health Organization Good Manufacturing Practice',
    },
    {
      name: 'FDA',
      Icon: Building2,
      description: 'US Food and Drug Administration Approved',
    },
    {
      name: 'ISO',
      Icon: Award,
      description: 'International Organization for Standardization',
    },
    {
      name: 'COA',
      Icon: FileText,
      description: 'Certificate of Analysis Documentation',
    },
    {
      name: 'DMF',
      Icon: FileSearch,
      description: 'Drug Master File Registration',
    },
    {
      name: 'GMP',
      Icon: CheckCircle2,
      description: 'Good Manufacturing Practice Certified',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        duration: 0.6,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
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
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/30 border-t border-blue-100 relative overflow-hidden">
      {/* Subtle radial gradient behind section header */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      <Container>
        <motion.div
          className="text-center mb-12 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
        >
          <div className="text-sm text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mb-6 font-medium">
            CERTIFICATIONS & STANDARDS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Compliance & Trust
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All suppliers are verified for quality and regulatory compliance.
          </p>
          <p className="text-base text-slate-500 mt-3">
            Your safety and trust are our top priorities.
          </p>
        </motion.div>

        {/* Certifications Grid - White Cards with Blue Icons */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {certifications.map((cert) => {
            const IconComponent = cert.Icon
            return (
              <motion.div
                key={cert.name}
                variants={cardVariants}
                className="group p-6 text-center bg-white border border-blue-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 cursor-default focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 relative overflow-hidden"
                tabIndex={0}
                role="article"
                aria-label={`${cert.name} certification`}
              >
                {/* Hover glow border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/20 via-blue-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-blue-700" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 tracking-tight">{cert.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{cert.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}

export default TrustLayerSection
