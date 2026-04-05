import { useEffect } from 'react'
import AboutHero from '../components/about/AboutHero'
import AboutMission from '../components/about/AboutMission'
import AboutWhoWeAre from '../components/about/AboutWhoWeAre'
import AboutWhyChoose from '../components/about/AboutWhyChoose'
import AboutContact from '../components/about/AboutContact'
import AboutTestimonials from '../components/about/AboutTestimonials'

/**
 * Matches reference_User_Ui/pages/AboutPage.jsx — sections only; Navbar/Footer come from MainLayout.
 */
function About() {
  useEffect(() => {
    document.title = 'About Us | Pharmetis - Global B2B Pharmaceutical Marketplace'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Pharmetis is a trusted B2B pharmaceutical marketplace connecting verified bulk medicine suppliers with global buyers. WHO-GMP, FDA compliant platform for secure medicine sourcing.'
      )
    }

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
      logo: `${window.location.origin}/logo-pharmetis.svg`,
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
      document.getElementById('organization-schema')?.remove()
      document.getElementById('website-schema')?.remove()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <AboutHero />
      <AboutMission />
      <AboutWhoWeAre />
      <AboutWhyChoose />
      <AboutTestimonials />
      <AboutContact />
    </div>
  )
}

export default About
