import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Globe,
  Building2,
  Target,
  Eye,
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  Package,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

function About() {
  // SEO: Update document title and meta tags
  useEffect(() => {
    document.title = 'About Us | Pharmetis - Global B2B Pharmaceutical Marketplace'
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Pharmetis is a trusted B2B pharmaceutical marketplace connecting verified bulk medicine suppliers with global buyers. WHO-GMP, FDA compliant platform for secure medicine sourcing.'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content =
        'Pharmetis is a trusted B2B pharmaceutical marketplace connecting verified bulk medicine suppliers with global buyers. WHO-GMP, FDA compliant platform for secure medicine sourcing.'
      document.head.appendChild(meta)
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute(
        'content',
        'B2B pharmaceutical marketplace, bulk medicine suppliers, verified pharma manufacturers, global medicine sourcing platform, WHO-GMP suppliers, FDA compliant pharma, pharmaceutical B2B platform, bulk medicine export, pharma trade marketplace'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content =
        'B2B pharmaceutical marketplace, bulk medicine suppliers, verified pharma manufacturers, global medicine sourcing platform, WHO-GMP suppliers, FDA compliant pharma, pharmaceutical B2B platform, bulk medicine export, pharma trade marketplace'
      document.head.appendChild(meta)
    }

    // Add structured data (JSON-LD) - Organization schema
    const orgScript = document.createElement('script')
    orgScript.type = 'application/ld+json'
    orgScript.id = 'organization-schema'
    orgScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pharmetis',
      description:
        'Global B2B pharmaceutical marketplace connecting verified bulk medicine suppliers with buyers worldwide',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.svg`,
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['English'],
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1250',
      },
    })
    document.head.appendChild(orgScript)

    const websiteScript = document.createElement('script')
    websiteScript.type = 'application/ld+json'
    websiteScript.id = 'website-schema'
    websiteScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pharmetis',
      url: window.location.origin,
      description:
        'Global B2B pharmaceutical marketplace for bulk medicine sourcing from verified suppliers',
    })
    document.head.appendChild(websiteScript)

    return () => {
      const orgScriptEl = document.getElementById('organization-schema')
      const websiteScriptEl = document.getElementById('website-schema')
      if (orgScriptEl) orgScriptEl.remove()
      if (websiteScriptEl) websiteScriptEl.remove()
    }
  }, [])

  const whyChooseUs = [
    {
      icon: ShieldCheck,
      title: 'Verified Suppliers',
      description: 'All suppliers undergo rigorous verification including WHO-GMP, FDA, and ISO certifications before joining our platform.',
      iconBg: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
    },
    {
      icon: Globe,
      title: 'Global Compliance Standards',
      description: 'Automated compliance checks ensure all transactions meet international regulatory requirements across 150+ countries.',
      iconBg: 'from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-700',
    },
    {
      icon: FileText,
      title: 'Secure RFQ Process',
      description: 'Structured Request for Quotation system with admin verification ensures transparency and security in every transaction.',
      iconBg: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
    },
    {
      icon: MessageSquare,
      title: 'Transparent Communication',
      description: 'Direct communication channels between buyers and suppliers with complete audit trail for all interactions.',
      iconBg: 'from-indigo-100 to-indigo-200',
      iconColor: 'text-indigo-700',
    },
    {
      icon: Lock,
      title: 'Escrow / Secure Payment',
      description: 'Secure payment processing with escrow services protects both buyers and suppliers throughout the transaction lifecycle.',
      iconBg: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-700',
    },
    {
      icon: Package,
      title: 'Bulk Order Focus',
      description: 'Specialized platform designed for bulk pharmaceutical sourcing with MOQ management and volume pricing.',
      iconBg: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-700',
    },
  ]

  const certifications = [
    { name: 'WHO-GMP', description: 'World Health Organization Good Manufacturing Practice', icon: ShieldCheck },
    { name: 'FDA', description: 'Food and Drug Administration Compliance', icon: Award },
    { name: 'ISO 9001', description: 'Quality Management Systems', icon: CheckCircle2 },
    { name: 'ISO 13485', description: 'Medical Devices Quality Management', icon: FileText },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center relative z-10"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Trusted Global Platform
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                About <span className="text-blue-700">Pharmetis</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                We are a global B2B pharmaceutical marketplace connecting verified bulk medicine suppliers with
                distributors, hospitals, importers, and manufacturers worldwide. Our platform ensures compliance,
                transparency, and security in every transaction.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/medicines">
                  <Button
                    variant="primary"
                    size="lg"
                    className="group rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.22)]"
                  >
                    Explore Platform
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/request-access">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl !border-0 bg-blue-50 !text-slate-900 hover:bg-blue-100"
                  >
                    Join Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop"
                  alt="Global pharmaceutical trade and manufacturing"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Company Overview Section */}
      <section className="py-24 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Who We Are</h2>
              <div className="w-24 h-1 bg-blue-700 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop"
                    alt="Pharmaceutical manufacturing facility"
                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Purpose</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Pharmetis is a trusted B2B pharmaceutical marketplace designed specifically for bulk medicine
                    sourcing. We bridge the gap between verified pharmaceutical manufacturers and global buyers,
                    ensuring every transaction meets the highest standards of quality and compliance.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">What We Do</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Our platform facilitates secure, compliant transactions between pharmaceutical suppliers and
                    buyers. We provide a structured RFQ system, automated compliance verification, secure payment
                    processing, and complete audit trails for all transactions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid grid-cols-2 gap-4 pt-4"
                >
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                    <Building2 className="w-6 h-6 text-blue-700 mb-2" />
                    <div className="font-semibold text-slate-900">Distributors</div>
                    <div className="text-sm text-slate-600">Wholesale distributors</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                    <Building2 className="w-6 h-6 text-blue-700 mb-2" />
                    <div className="font-semibold text-slate-900">Hospitals</div>
                    <div className="text-sm text-slate-600">Healthcare institutions</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                    <Building2 className="w-6 h-6 text-blue-700 mb-2" />
                    <div className="font-semibold text-slate-900">Importers</div>
                    <div className="text-sm text-slate-600">International importers</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                    <Building2 className="w-6 h-6 text-blue-700 mb-2" />
                    <div className="font-semibold text-slate-900">Manufacturers</div>
                    <div className="text-sm text-slate-600">Pharma manufacturers</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group bg-white rounded-2xl border border-blue-100 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To revolutionize global pharmaceutical trade by providing a secure, compliant, and transparent
                B2B marketplace that connects verified bulk medicine suppliers with buyers worldwide. We
                ensure every transaction meets international regulatory standards while facilitating seamless
                global commerce.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group bg-white rounded-2xl border border-blue-100 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Our Vision</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">
                To become the world's most trusted B2B pharmaceutical marketplace, recognized for our
                commitment to compliance, quality, and transparency. We envision a future where global
                pharmaceutical trade is seamless, secure, and accessible to verified buyers and suppliers
                worldwide.
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We provide enterprise-grade infrastructure for global pharmaceutical trade with unmatched
              compliance and security standards.
            </p>
            <div className="w-24 h-1 bg-blue-700 mx-auto rounded-full mt-4"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          >
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-white border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-transparent transition-all duration-300 -z-10"></div>
                
                <div className={`p-4 bg-gradient-to-br ${item.iconBg} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Compliance & Trust Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Compliance & Trust</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform maintains the highest standards of regulatory compliance and quality assurance.
            </p>
            <div className="w-24 h-1 bg-blue-700 mx-auto rounded-full mt-4"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-2xl border border-blue-100 p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <cert.icon className="w-8 h-8 text-blue-700" />
                </div>
                <div className="font-bold text-slate-900 text-lg mb-2">{cert.name}</div>
                <div className="text-sm text-slate-600">{cert.description}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-blue-100 p-10 max-w-5xl mx-auto shadow-xl"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Quality Verification Process
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center group"
              >
                <div className="p-4 bg-emerald-100 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="font-semibold text-slate-900 mb-2 text-lg">Supplier Verification</div>
                <div className="text-slate-600">Rigorous pre-qualification process</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center group"
              >
                <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <div className="font-semibold text-slate-900 mb-2 text-lg">Audit Trail</div>
                <div className="text-slate-600">Complete transaction documentation</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center group"
              >
                <div className="p-4 bg-blue-100 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShieldCheck className="w-10 h-10 text-blue-700" />
                </div>
                <div className="font-semibold text-slate-900 mb-2 text-lg">Ongoing Monitoring</div>
                <div className="text-slate-600">Continuous compliance checks</div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 border-t border-blue-100">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-600 mb-10">
              Join thousands of verified buyers and suppliers on the world's most trusted B2B pharmaceutical
              marketplace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/medicines">
                <Button variant="primary" size="lg" className="group shadow-lg hover:shadow-xl transition-shadow">
                  Start Sourcing
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/request-access">
                <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                  List Your Products
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}

export default About
