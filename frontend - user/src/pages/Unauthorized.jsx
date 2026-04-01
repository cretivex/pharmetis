import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'

function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-20 flex items-center relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>
      <Container>
        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-8 shadow-xl shadow-blue-100/50 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-2xl mb-6">
              <ShieldX className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Access Restricted</h1>
            <p className="text-lg text-slate-600 mb-2">
              Access restricted to buyer accounts.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              You need a buyer account to access this section. Please contact your administrator or log in with a buyer account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 font-medium text-white shadow-lg shadow-black/25 transition-colors hover:bg-neutral-800"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border-2 border-neutral-200 px-6 py-3 font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Unauthorized
