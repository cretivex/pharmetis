import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import SuppliersHero from '../components/suppliers/SuppliersHero'
import SuppliersFilterBar from '../components/suppliers/SuppliersFilterBar'
import SuppliersGrid from '../components/suppliers/SuppliersGrid'
import WhyPartnerSection from '../components/suppliers/WhyPartnerSection'
import SuppliersCtaSection from '../components/suppliers/SuppliersCtaSection'

export default function SuppliersPage() {
  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <Navbar />
      <main>
        <SuppliersHero />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <SuppliersFilterBar />
          <SuppliersGrid />
        </div>
        <WhyPartnerSection />
        <SuppliersCtaSection />
      </main>
      <Footer />
    </div>
  )
}
