import { motion } from 'framer-motion'
import Container from '../ui/Container'
import { ShieldCheck, FileText, Shield, Wallet, Truck, CheckCircle } from 'lucide-react'

function ExecutionFlowSection() {
  const steps = [
    { 
      Icon: ShieldCheck, 
      label: 'Verify' 
    },
    { 
      Icon: FileText, 
      label: 'RFQ' 
    },
    { 
      Icon: Shield, 
      label: 'Compliance' 
    },
    { 
      Icon: Wallet, 
      label: 'Payment' 
    },
    { 
      Icon: Truck, 
      label: 'Ship' 
    },
    { 
      Icon: CheckCircle, 
      label: 'Deliver' 
    },
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

  const stepVariants = {
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
    <section className="py-24 bg-gradient-to-b from-white to-blue-50/30 border-t border-blue-100 relative overflow-hidden">
      {/* Soft radial background glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      <Container>
        <motion.div
          className="text-center mb-20 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
        >
          <div className="text-sm text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mb-6 font-medium">
            PROCESS FLOW
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Simple, secure, and compliant pharmaceutical sourcing process.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {steps.map((step, index) => {
            const IconComponent = step.Icon
            return (
              <motion.div key={index} className="flex items-center" variants={stepVariants}>
                <div className="flex flex-col items-center">
                  {/* Enhanced step card */}
                  <div className="w-20 h-20 rounded-xl bg-white border border-blue-100 flex items-center justify-center mb-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:scale-110 hover:-translate-y-1 group relative overflow-hidden" role="img" aria-label={step.label}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-200/20 via-blue-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <IconComponent className="w-10 h-10 text-blue-700 relative z-10" strokeWidth={2} aria-hidden="true" />
                  </div>
                  {/* Text label */}
                  <span className="text-sm font-medium text-slate-900">{step.label}</span>
                </div>
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block w-12 lg:w-16 h-0.5 bg-blue-200 mx-4 lg:mx-6"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                  ></motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}

export default ExecutionFlowSection
