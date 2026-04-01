import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Label } from './ui/Label'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import { useCurrency } from '../contexts/CurrencyContext'

/**
 * Modal to collect requested price and optional message for "Request Lower Price".
 * Replaces browser prompt() for a styled, accessible UX.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {(requestedPrice: number, message: string | null) => void} onSubmit
 * @param {number} currentPrice - Current quotation price to display
 * @param {string} [currency='USD']
 * @param {boolean} [submitting=false] - When true, disables submit to prevent double-clicks
 */
export default function RequestPriceModal({ isOpen, onClose, onSubmit, currentPrice, currency = 'USD', submitting = false }) {
  const { formatPrice } = useCurrency()
  const [requestedPriceInput, setRequestedPriceInput] = useState('')
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const suggested = currentPrice != null && !isNaN(currentPrice) ? (currentPrice * 0.9).toFixed(2) : ''
      setRequestedPriceInput(suggested)
      setMessage('')
      setValidationError(null)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentPrice])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setValidationError(null)
    const num = parseFloat(requestedPriceInput)
    if (requestedPriceInput.trim() === '' || isNaN(num)) {
      setValidationError('Please enter a valid requested price.')
      return
    }
    if (currentPrice != null && !isNaN(currentPrice) && num >= currentPrice) {
      setValidationError('Requested price must be lower than the current price.')
      return
    }
    if (num < 0) {
      setValidationError('Price must be a positive number.')
      return
    }
    const msg = message.trim() || null
    onSubmit(num, msg)
  }

  const displayPrice =
    currentPrice != null && !isNaN(currentPrice)
      ? formatPrice(currentPrice, currency || 'USD')
      : '—'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-price-modal-title"
    >
      <div
        className="bg-white border border-blue-200 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-blue-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 id="request-price-modal-title" className="text-xl font-semibold text-slate-900">
            Request Lower Price
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-600 hover:bg-blue-50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="request-price-current" className="text-slate-600">
              Current Price
            </Label>
            <p id="request-price-current" className="text-lg font-semibold text-slate-900 mt-1">
              {displayPrice}
            </p>
          </div>
          <div>
            <Label htmlFor="request-price-input">Requested Price *</Label>
            <Input
              id="request-price-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={requestedPriceInput}
              onChange={(e) => setRequestedPriceInput(e.target.value)}
              className="mt-1 border-blue-200 text-slate-900"
            />
          </div>
          <div>
            <Label htmlFor="request-price-message">Message to supplier (optional)</Label>
            <Textarea
              id="request-price-message"
              rows={3}
              placeholder="Add a note for the supplier..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 border-blue-200 text-slate-900"
            />
          </div>
          {validationError && (
            <p className="text-sm text-red-600" role="alert">
              {validationError}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
