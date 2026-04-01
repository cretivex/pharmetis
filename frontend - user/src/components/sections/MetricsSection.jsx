import { motion } from 'framer-motion'
import Container from '../ui/Container'

function MetricsSection() {
  const slas = [
    { metric: 'RFQ response', value: '< 48 hours' },
    { metric: 'Compliance review', value: '< 72 hours' },
    { metric: 'On-time shipment', value: '> 90%' },
    { metric: 'Repeat buyer rate', value: '> 50%' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100 relative overflow-hidden">
      {/* Soft radial background glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      <Container>
        <motion.div
          className="text-center mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
        >
          <div className="text-sm text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mb-6 font-medium">
            PERFORMANCE SLAs
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Performance Metrics
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Industry-leading SLAs that ensure reliable and efficient operations.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {slas.map((sla, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white border border-blue-100 rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              role="article"
              aria-label={`${sla.metric}: ${sla.value}`}
            >
              {/* Hover glow border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/20 via-blue-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-2xl font-bold text-blue-700 mb-2">{sla.value}</div>
                <div className="text-sm text-slate-600 capitalize">{sla.metric}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

export default MetricsSection
