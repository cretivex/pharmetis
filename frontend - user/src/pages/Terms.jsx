import { useEffect } from 'react'
import Container from '../components/ui/Container'

function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service | Phartimetic B2B Pharmaceutical Marketplace India'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Read the Terms of Service of Phartimetic, a B2B pharmaceutical marketplace in India for medicine suppliers, pharma vendors, pharmacies, and hospitals.'
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
      <Container className="mx-auto max-w-5xl">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="mt-3 text-sm text-slate-600">
            <strong>Effective Date:</strong> 31 March 2026
          </p>
          <p className="text-sm text-slate-600">
            <strong>Location:</strong> India
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            These Terms of Service govern use of Phartimetic, a B2B pharmaceutical marketplace connecting medicine
            suppliers, pharma vendors, pharmacies, hospitals, and institutional buyers for online medicine wholesale.
            By creating an account or using the platform, you agree to these terms.
          </p>

          <h2 className="mt-8 text-xl font-semibold">1. Marketplace Status and Scope</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Phartimetic is a digital marketplace and not a manufacturer of medicines. The platform does not produce
            pharmaceutical products. Vendors and buyers remain directly responsible for lawful trade, product quality
            representations, documentation, and compliance obligations applicable to their transactions.
          </p>

          <h2 className="mt-8 text-xl font-semibold">2. Eligibility and Accounts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Only authorized business entities and their representatives may use the platform.</li>
            <li>Users must maintain accurate vendor account or buyer account information.</li>
            <li>OTP login may be required for secure authentication and account recovery.</li>
            <li>Users are responsible for all actions performed through their registered accounts.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">3. Order System and Transaction Flow</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Phartimetic provides order system tools to request, place, track, and manage procurement transactions.
            Orders may become binding upon supplier confirmation and completion of required compliance steps. Delivery
            timelines are estimates and may vary based on stock, documentation, and logistics constraints.
          </p>

          <h2 className="mt-8 text-xl font-semibold">4. Third-Party Delivery</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Delivery is fulfilled by independent third-party delivery partners. Phartimetic may share required shipment
            information for fulfillment. Users acknowledge that delivery partner performance, route restrictions, and
            operational delays may affect timelines and are subject to applicable partner terms.
          </p>

          <h2 className="mt-8 text-xl font-semibold">5. User Responsibilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Provide complete, accurate, and lawful registration and order information.</li>
            <li>Ensure listings, pricing, inventory details, and product claims are not misleading.</li>
            <li>Use OTP login and account credentials securely and prevent unauthorized access.</li>
            <li>Comply with applicable pharmaceutical, trade, tax, and data laws in India.</li>
            <li>Cooperate with verification reviews, fraud checks, and dispute processes.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">6. Company Responsibilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Maintain core B2B pharmaceutical marketplace infrastructure and service availability.</li>
            <li>Operate account, catalog, and order workflows with reasonable security controls.</li>
            <li>Protect data according to platform privacy commitments and applicable law.</li>
            <li>Take proportionate action against misuse, fraud, or unlawful content.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">7. Prohibited Conduct</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Listing counterfeit, restricted, illegal, or misrepresented pharmaceutical products.</li>
            <li>Misusing the platform for unauthorized access, scraping, spam, or security circumvention.</li>
            <li>Submitting false documents, compliance claims, certifications, or pricing information.</li>
            <li>Uploading malicious code or content that disrupts marketplace operations.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">8. Data Protection and Privacy</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Personal and business data processing is governed by the Privacy Policy. By using the platform, users
            consent to necessary processing for account management, order handling, risk controls, customer support,
            and lawful compliance.
          </p>

          <h2 className="mt-8 text-xl font-semibold">9. Suspension and Termination</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Phartimetic may suspend, limit, or terminate account access where there are legal risks, policy violations,
            suspected fraud, repeated abuse, or failure to provide required verification documentation.
          </p>

          <h2 className="mt-8 text-xl font-semibold">10. Disclaimers and Liability</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            The platform is provided on an as-is and as-available basis to the extent permitted by law. Phartimetic
            does not independently guarantee product efficacy, merchantability, or uninterrupted service. To the maximum
            extent permitted by law, Phartimetic is not liable for indirect or consequential losses arising from user
            disputes, third-party delivery delays, or regulatory actions beyond platform control.
          </p>

          <h2 className="mt-8 text-xl font-semibold">11. Governing Law</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            These Terms are governed by the laws of India, and disputes shall be subject to competent jurisdiction in
            India unless otherwise required by applicable law.
          </p>

          <h2 className="mt-8 text-xl font-semibold">12. Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            For legal notices, policy questions, or account assistance, contact{' '}
            <a className="font-medium text-blue-700 hover:underline" href="mailto:support@phartimetic.com">
              support@phartimetic.com
            </a>
            .
          </p>
        </article>
      </Container>
    </div>
  )
}

export default Terms
