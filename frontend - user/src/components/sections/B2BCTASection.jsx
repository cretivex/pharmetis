import Container from '../ui/Container'
import { motion } from 'framer-motion'

function B2BCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>
      
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Start Sourcing Globally
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of verified buyers and suppliers on the world's most trusted pharmaceutical B2B platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-lg font-semibold bg-white text-blue-700 rounded-lg hover:bg-blue-50 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            >
              Start Sourcing Globally
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-lg font-semibold bg-transparent border-2 border-white/70 text-white rounded-lg hover:bg-white/10 hover:border-white hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            >
              List Your Products
            </motion.button>
          </div>
          <p className="text-sm text-blue-200 font-medium">
            Trusted by global buyers and certified manufacturers.
          </p>
        </motion.div>
      </Container>
    </section>
  )
}

export default B2BCTASection
