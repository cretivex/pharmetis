import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { useProfileCompletion } from '../../contexts/ProfileCompletionContext'

function StepRow({ done, title, description, to, actionLabel }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="shrink-0 pt-0.5">
        {done ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden />
        ) : (
          <Circle className="h-6 w-6 text-slate-300" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        {to && (
          <Link
            to={to}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { complete: profileComplete, missingFields, percentage, isBuyer, loading } = useProfileCompletion()

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-slate-500 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Getting started</h1>
        <p className="mt-2 text-slate-600">
          Follow these steps to move from signup to your first order. You can return here anytime from the dashboard.
        </p>
      </div>

      <div className="space-y-3">
        <StepRow
          done
          title="Verify your email"
          description="Your email was verified during registration with a one-time code."
          to="/settings?tab=profile"
          actionLabel="Account & security"
        />
        <StepRow
          title="Compliance & verification (KYC)"
          description="Add business registration, tax IDs, and license documents under Company settings so we can verify your entity."
          to="/settings?tab=company"
          actionLabel="Company & documents"
        />
        <StepRow
          done={Boolean(profileComplete)}
          title="Complete your company profile"
          description={
            profileComplete
              ? 'Profile requirements are satisfied for RFQs and procurement.'
              : `Still needed: ${missingFields.join(', ')} (${percentage}% complete).`
          }
          to="/settings?tab=profile"
          actionLabel={profileComplete ? 'Review profile' : 'Complete profile'}
        />
        <StepRow
          title="Submit an RFQ"
          description="Request quotes for products you need from verified suppliers."
          to="/send-rfq"
          actionLabel="Start RFQ"
        />
        <StepRow
          title="Receive and review quotations"
          description="Track responses and compare offers in your RFQ workspace."
          to="/buyer/rfqs"
          actionLabel="Open RFQs"
        />
        <StepRow
          title="Place an order"
          description="When you accept a quotation, complete checkout with delivery details and proceed to payment."
          to="/my-rfqs"
          actionLabel="Go to My RFQs"
        />
      </div>

      {!isBuyer && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Buyer-only steps apply to purchasing accounts. If you need a buyer account, register or contact support.
        </p>
      )}
    </div>
  )
}
