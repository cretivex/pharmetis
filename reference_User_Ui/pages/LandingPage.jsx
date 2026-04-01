import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import TrustBar from '../components/landing/TrustBar'
import FeaturedProducts from '../components/landing/FeaturedProducts'
import VerifiedSuppliers from '../components/landing/VerifiedSuppliers'
import HowItWorks from '../components/landing/HowItWorks'
import LandingCtaSection from '../components/landing/LandingCtaSection'
import ComplianceSection from '../components/landing/ComplianceSection'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hash])

  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <FeaturedProducts />
        <VerifiedSuppliers />
        <HowItWorks />
        <LandingCtaSection />
        <ComplianceSection />
      </main>
      <Footer />
    </div>
  )
}
