import Container from '../ui/Container'
import Button from '../ui/Button'

function PlatformPreviewSection() {
  const categories = [
    {
      title: 'Nutraceuticals',
      description: 'Dietary supplements and wellness products',
      icon: '💚',
    },
    {
      title: 'Veterinary Medicines',
      description: 'Animal health and care products',
      icon: '🐾',
    },
    {
      title: 'Cold Chain Products',
      description: 'Temperature-controlled pharmaceuticals',
      icon: '❄️',
    },
  ]

  const suppliers = [
    {
      name: 'MediPharma Industries',
      location: 'IN India',
      certifications: ['WHO-GMP', 'FDA', 'ISO 9001'],
      products: 450,
      logo: '🛡️',
    },
    {
      name: 'GlobalPharma Solutions',
      location: 'DE Germany',
      certifications: ['WHO-GMP', 'ISO 13485', 'GMP'],
      products: 320,
      logo: '⭐',
    },
    {
      name: 'BioMed Exports Ltd',
      location: 'GB United Kingdom',
      certifications: ['FDA', 'ISO 9001', 'MHRA'],
      products: 280,
      logo: '🌿',
    },
    {
      name: 'PharmaCore International',
      location: 'US United States',
      certifications: ['FDA', 'WHO-GMP', 'ISO 13485'],
      products: 380,
      logo: '⚕️',
    },
    {
      name: 'Asian Pharma Group',
      location: 'CN China',
      certifications: ['WHO-GMP', 'ISO 9001', 'GMP'],
      products: 520,
      logo: '🔬',
    },
    {
      name: 'HealthCare Manufacturers',
      location: 'IN India',
      certifications: ['WHO-GMP', 'FDA', 'ISO 9001'],
      products: 310,
      logo: '➕',
    },
  ]

  return (
    <section className="py-24 bg-blue-50">
      <Container>
        {/* Product Categories */}
        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 text-center tracking-tight">
            Product Categories
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white border border-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={category.title}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-3xl mb-4" aria-hidden="true">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">{category.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{category.description}</p>
                <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800">
                  Explore Products →
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Suppliers */}
        <div className="mt-24 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">
              Verified Global Suppliers
            </h2>
            <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
              Connect with certified pharmaceutical manufacturers and exporters worldwide
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier, index) => (
              <div
                key={index}
                className="group bg-white border border-blue-100 rounded-2xl p-6 shadow-[0_10px_30px_rgba(37,99,235,0.08)] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(37,99,235,0.15)] transition-all duration-300 ease-out relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={`${supplier.name} supplier profile`}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-blue-50/40 opacity-60 pointer-events-none" aria-hidden="true"></div>
                
                {/* Content Container */}
                <div className="relative z-10 space-y-5">
                  {/* Top Row: Icon, Company Info, Verified Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl p-4 shadow-inner group-hover:bg-blue-200 transition duration-300 flex items-center justify-center text-2xl flex-shrink-0" aria-hidden="true">
                        {supplier.logo}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{supplier.name}</h3>
                        <p className="text-sm text-slate-600">{supplier.location}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm group-hover:scale-105 transition duration-300 flex items-center space-x-1 flex-shrink-0">
                      <span>✓</span>
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Middle: Certification Tags */}
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((cert, certIndex) => (
                      <span
                        key={certIndex}
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100 hover:bg-blue-100 transition duration-200"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Row: Product Count and CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-600">{supplier.products} Products</span>
                    <button
                      className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`View products from ${supplier.name}`}
                    >
                      <span className="relative z-10">View Products</span>
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

export default PlatformPreviewSection
