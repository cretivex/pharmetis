import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import AboutHero from '../components/about/AboutHero'
import AboutMission from '../components/about/AboutMission'
import AboutWhoWeAre from '../components/about/AboutWhoWeAre'
import AboutWhyChoose from '../components/about/AboutWhyChoose'
import AboutContact from '../components/about/AboutContact'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Navbar />
      <main>
        <AboutHero />
        <AboutMission />
        <AboutWhoWeAre />
        <AboutWhyChoose />
        <AboutContact />
      </main>
      <Footer />
    </div>
  )
}
