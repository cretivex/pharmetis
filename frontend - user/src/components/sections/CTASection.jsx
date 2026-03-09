import { motion } from 'framer-motion'
import Container from '../ui/Container'
import Button from '../ui/Button'

function CTASection() {
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

  const featuresVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100 relative overflow-hidden">
      {/* Soft radial background glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-0"></div>
      
      <Container>
        <motion.div
          className="text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={headerVariants}
        >
          <div className="text-sm text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mb-6 font-medium">
            GET STARTED
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">
            Start Sourcing or Selling Pharmaceuticals Globally
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of verified buyers and suppliers on the world's most trusted pharmaceutical B2B platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="outline" size="lg">
              Register as Buyer
            </Button>
            <Button variant="primary" size="lg">
              Register as Supplier
            </Button>
          </div>
          <motion.div
            className="flex flex-wrap justify-center gap-8 text-slate-600"
            role="list"
            aria-label="Platform features"
            variants={featuresVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div className="flex items-center space-x-2" role="listitem" variants={featureVariants}>
              <span className="text-blue-700" aria-hidden="true">✓</span>
              <span>Verified Suppliers</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2" role="listitem" variants={featureVariants}>
              <span className="text-blue-700" aria-hidden="true">🔒</span>
              <span>Secure Payments</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2" role="listitem" variants={featureVariants}>
              <span className="text-blue-700" aria-hidden="true">🌍</span>
              <span>Global Reach</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2" role="listitem" variants={featureVariants}>
              <span className="text-blue-700" aria-hidden="true">💬</span>
              <span>24/7 Support</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

export default CTASection
