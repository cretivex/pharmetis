import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Loading from '../../components/ui/Loading'
import ErrorState from '../../components/ui/ErrorState'
import { rfqService } from '../../services/rfq.service'
import { useCurrency } from '../../contexts/CurrencyContext'
import { useProfileCompletion } from '../../contexts/ProfileCompletionContext'
import CardGrid from '../../components/layout/CardGrid'

function Dashboard() {
  const { formatPrice } = useCurrency()
  const { complete: profileComplete, missingFields, percentage, isBuyer } = useProfileCompletion()
  const [stats, setStats] = useState({
    activeRFQs: 0,
    pendingQuotes: 0
  })
  const [recentRFQs, setRecentRFQs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const rfqsData = await rfqService.getAll({ limit: 5 })
      const rfqs = Array.isArray(rfqsData) ? rfqsData : []

      const activeRFQs = rfqs.filter(r => ['OPEN', 'SENT', 'QUOTED'].includes(r.status)).length
      const pendingQuotes = rfqs.filter(r => r.status === 'QUOTED').length

      setStats({ activeRFQs, pendingQuotes })
      setRecentRFQs(rfqs.slice(0, 5))
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': { color: 'bg-blue-100 text-blue-700', label: 'Open' },
      'SENT': { color: 'bg-amber-100 text-amber-700', label: 'Sent' },
      'QUOTED': { color: 'bg-emerald-100 text-emerald-700', label: 'Quoted' },
    }
    const statusInfo = statusMap[status] || { color: 'bg-slate-100 text-slate-700', label: status }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-blue-200 bg-white py-12">
        <ErrorState message={error} onRetry={loadDashboardData} retry="Retry" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your overview.</p>
      </div>

      {/* Profile incomplete warning */}
      {isBuyer && !profileComplete && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Complete your profile</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your profile is {percentage}% complete. Add the missing details to submit RFQs: {missingFields.join(', ')}.
              </p>
            </div>
          </div>
          <Link
            to="/settings?tab=profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors shrink-0"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <CardGrid className="gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.activeRFQs}</h3>
          <p className="text-sm text-slate-600">Active RFQs</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.pendingQuotes}</h3>
          <p className="text-sm text-slate-600">Pending Quotes</p>
        </motion.div>

      </CardGrid>

      {/* Recent RFQs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent RFQs</h2>
          <Link
            to="/buyer/rfqs"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          {recentRFQs.length > 0 ? (
            <div className="space-y-4">
              {recentRFQs.map((rfq) => (
                <Link
                  key={rfq.id}
                  to={`/buyer/rfqs/${rfq.id}`}
                  className="block p-4 rounded-lg border border-slate-200 hover:bg-blue-50/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">
                        {rfq.title || `RFQ #${rfq.rfqNumber || rfq.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {rfq.items?.length || 0} items • {rfq.responses || 0} responses
                      </p>
                    </div>
                    {getStatusBadge(rfq.status)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No RFQs yet</p>
              <Link
                to="/send-rfq"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Create your first RFQ
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard
