import { useEffect } from 'react'
import Container from '../components/ui/Container'

function Privacy() {
  useEffect(() => {
    document.title = 'Privacy Policy | Phartimetic B2B Pharmaceutical Marketplace India'

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Read the Privacy Policy of Phartimetic, a B2B pharmaceutical marketplace in India connecting medicine suppliers, pharma vendors, pharmacies, and hospitals for online medicine wholesale.'
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
      <Container className="mx-auto max-w-5xl">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-600">
            <strong>Effective Date:</strong> 31 March 2026
          </p>
          <p className="text-sm text-slate-600">
            <strong>Location:</strong> India
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Phartimetic operates a B2B pharmaceutical marketplace that connects medicine suppliers, pharma vendors,
            pharmacies, hospitals, and other institutional buyers for online medicine wholesale transactions. This
            Privacy Policy explains how we collect, use, protect, share, and retain business and personal data when
            you use this pharmaceutical platform India marketplace.
          </p>

          <h2 className="mt-8 text-xl font-semibold">1. Platform Scope and Role</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Phartimetic is a marketplace technology provider. Phartimetic is not a manufacturer of medicines and does
            not produce pharmaceutical products. The platform provides account management, catalog management, order
            flow tools, and delivery coordination support through independent third-party delivery partners.
          </p>

          <h2 className="mt-8 text-xl font-semibold">2. Information We Collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>
              Account and identity details, including name, phone number for OTP login, email, business profile,
              company details, and account type (vendor account or buyer account).
            </li>
            <li>
              Product and catalog information submitted by medicine suppliers and pharma vendors, including regulatory
              and compliance documents where required.
            </li>
            <li>
              Order system data, including purchase requests, product quantities, pricing terms, invoices, addresses,
              order history, and communications.
            </li>
            <li>
              Technical and security logs, including IP address, browser type, usage patterns, and authentication
              events used for fraud prevention and platform protection.
            </li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">3. OTP Login and Account Security</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Phartimetic uses OTP login to verify user identity and secure access to vendor accounts and buyer accounts.
            We process OTP validation attempts, login timestamps, and related device signals to prevent unauthorized
            access and to safeguard marketplace operations.
          </p>

          <h2 className="mt-8 text-xl font-semibold">4. Why We Process Data</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>To register and maintain buyer and vendor accounts.</li>
            <li>To operate core B2B pharmaceutical marketplace functions and online medicine wholesale workflows.</li>
            <li>To support the order system, order confirmations, and transaction records.</li>
            <li>To share logistics details with third-party delivery partners for shipment completion.</li>
            <li>To provide customer support, risk controls, legal compliance, and platform analytics.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">5. Data Sharing Principles</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            We do not sell personal data. We may share relevant data with transaction counterparties, delivery partners,
            contracted service providers, and lawful authorities where required by law or necessary for platform
            operation, fraud prevention, dispute handling, and compliance.
          </p>

          <h2 className="mt-8 text-xl font-semibold">6. Third-Party Delivery and Logistics</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Delivery is handled by third-party delivery partners. To execute delivery, Phartimetic may share shipment
            details such as consignee information, pickup and destination details, and order reference metadata.
          </p>

          <h2 className="mt-8 text-xl font-semibold">7. Company Responsibilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Implement reasonable technical and organizational safeguards to protect marketplace data.</li>
            <li>Use data for legitimate business and compliance purposes only.</li>
            <li>Maintain accountable processor relationships and privacy safeguards with service partners.</li>
            <li>Respond to valid user privacy requests in a reasonable timeframe.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">8. User Responsibilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
            <li>Provide accurate, lawful, and current account and order information.</li>
            <li>Protect OTP channels, account credentials, and authorized device access.</li>
            <li>Upload only lawful catalog and business data relevant to platform use.</li>
            <li>Promptly report suspicious activity or potential account compromise.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">9. Data Protection and Retention</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            We retain information for as long as necessary to provide platform services, maintain records, resolve
            disputes, prevent fraud, and satisfy legal obligations. We use commercially reasonable controls, including
            access restrictions, monitoring, and incident response procedures, to protect stored and processed data.
          </p>

          <h2 className="mt-8 text-xl font-semibold">10. Policy Updates</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            We may revise this Privacy Policy periodically to reflect legal, technical, and operational changes.
            Updated versions are effective when posted on the platform unless otherwise required by applicable law.
          </p>

          <h2 className="mt-8 text-xl font-semibold">11. Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            For privacy questions, requests, or incident reports, contact{' '}
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

export default Privacy
