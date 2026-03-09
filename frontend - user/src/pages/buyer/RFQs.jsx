import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Eye, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { rfqService } from '../../services/rfq.service'

function RFQs() {
  const navigate = useNavigate()
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadRFQs()
  }, [filterStatus])

  const loadRFQs = async () => {
    try {
      setLoading(true)
      setError(null)

      const statusMap = {
        'All': undefined,
        'Open': 'OPEN',
        'Closed': 'CLOSED',
        'Awarded': 'ACCEPTED'
      }

      const filters = {
        status: statusMap[filterStatus],
        limit: 100
      }

      const result = await rfqService.getAll(filters)
      const rfqsData = Array.isArray(result) ? result : []
      setRfqs(rfqsData)
    } catch (err) {
      setError(err.message || 'Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': { color: 'bg-blue-100 text-blue-700', label: 'Open' },
      'CLOSED': { color: 'bg-slate-100 text-slate-700', label: 'Closed' },
      'AWARDED': { color: 'bg-emerald-100 text-emerald-700', label: 'Awarded' },
      'EXPIRED': { color: 'bg-red-100 text-red-700', label: 'Expired' },
    }
    const statusInfo = statusMap[status] || { color: 'bg-slate-100 text-slate-700', label: status }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const filteredRFQs = rfqs.filter(rfq => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        rfq.title?.toLowerCase().includes(query) ||
        rfq.rfqNumber?.toLowerCase().includes(query) ||
        rfq.items?.some(item => item.productName?.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">RFQs</h1>
          <p className="text-slate-600">Manage your Request for Quotations</p>
        </div>
        <Link
          to="/send-rfq"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create RFQ
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search RFQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Open', 'Closed', 'Awarded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary/50 hover:bg-blue-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <Loading message="Loading RFQs..." />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <ErrorState message={error} onRetry={loadRFQs} retry="Retry" />
        </div>
      )}

      {!loading && !error && filteredRFQs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFQ ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Therapeutic Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quotes Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRFQs.map((rfq) => {
                    const firstItem = rfq.items?.[0]
                    return (
                      <tr key={rfq.id} className="hover:bg-blue-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          #{rfq.rfqNumber || rfq.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {firstItem?.productName || 'Multiple Products'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {firstItem?.therapeuticCategory || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {rfq.items?.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(rfq.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {rfq.responses || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/buyer/rfqs/${rfq.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredRFQs.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <EmptyState
            icon={FileText}
            title="No RFQs found"
            description="Create an RFQ to get quotes from suppliers"
            actionLabel="Create RFQ"
            onAction={() => navigate('/send-rfq')}
          />
        </div>
      )}
    </div>
  )
}

export default RFQs
