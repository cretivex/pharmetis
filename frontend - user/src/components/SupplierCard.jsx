import { motion } from 'framer-motion'
import { CheckCircle2, Building2 } from 'lucide-react'
import Button from './ui/Button'

function SupplierCard({ supplier, onViewSupplier, onSendInquiry }) {
  return (
    <motion.div
      className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 transition-all duration-300 group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:via-blue-50/20 group-hover:to-blue-50/10 transition-all duration-300 pointer-events-none -z-10" />
      {/* Supplier Header with Image */}
      <div className="flex items-start gap-3 mb-4">
        {/* Supplier Logo/Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-blue-200 flex items-center justify-center overflow-hidden">
            {supplier.image ? (
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Company Name & Location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 truncate">{supplier.name}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{supplier.country}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full flex-shrink-0 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="mb-4 space-y-2 pb-4 border-b border-blue-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Products:</span>
          <span className="font-semibold text-slate-900">{supplier.totalProducts || 0}</span>
        </div>
        {supplier.yearsInBusiness && supplier.yearsInBusiness > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Years in Business:</span>
            <span className="font-semibold text-slate-900">{supplier.yearsInBusiness}</span>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {supplier.certifications.map((cert, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full border border-blue-100"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs font-medium group-hover:border-blue-400 group-hover:text-blue-700 transition-colors"
          onClick={() => onViewSupplier(supplier)}
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1 text-xs font-medium"
          onClick={() => onSendInquiry(supplier)}
        >
          Send Inquiry
        </Button>
      </div>
    </motion.div>
  )
}

export default SupplierCard
