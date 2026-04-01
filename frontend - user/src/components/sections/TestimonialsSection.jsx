import { motion } from 'framer-motion'
import Container from '../ui/Container'

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      title: 'Chief Procurement Officer',
      quote: 'Pharmetis transformed our sourcing process. We reduced compliance review time by 70% and gained complete visibility into our supply chain.',
      avatar: '👩‍💼',
    },
    {
      name: 'Rajesh Kumar',
      title: 'Export Director',
      quote: 'The platform\'s automated compliance checks and document management saved us countless hours. We\'ve expanded to 15 new markets in just 6 months.',
      avatar: '👨‍💼',
    },
    {
      name: 'Maria Rodriguez',
      title: 'VP of Supply Chain',
      quote: 'Trust and transparency are everything in pharma trade. Pharmetis delivers both with their rigorous verification process and real-time tracking.',
      avatar: '👩‍🔬',
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
    <section className="py-24 bg-gradient-to-b from-white to-blue-50/30 border-t border-blue-100 relative overflow-hidden">
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
            TRUSTED BY LEADERS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Global Pharma Leaders Choose Our Platform
          </h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white border border-blue-100 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              role="article"
              aria-label={`Testimonial from ${testimonial.name}`}
            >
              {/* Hover glow border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200/20 via-blue-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-blue-200 transition-colors duration-300" aria-hidden="true">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{testimonial.name}</h3>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  </div>
                </div>
                <div className="text-4xl text-blue-200 mb-4">"</div>
                <p className="text-slate-700 leading-relaxed">{testimonial.quote}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

export default TestimonialsSection
