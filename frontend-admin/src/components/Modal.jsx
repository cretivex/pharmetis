import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'
import { logError } from '@/lib/observability'

/**
 * Shared modal wrapper. Use for confirmations and forms.
 */
export function Modal({ open, onOpenChange, title, description, children, className }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('bg-card border border-border', className)}>
        <DialogClose onClose={() => onOpenChange(false)} />
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Confirmation modal for destructive actions. Disables confirm and prevents close while async running.
 * Shows toast on error; never allows destructive action without proper feedback.
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title = 'Confirm action',
  message = 'Are you sure? This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
  loading = false,
}) {
  const toast = useToast()
  const [submitting, setSubmitting] = React.useState(false)
  const isBusy = loading || submitting

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      await Promise.resolve(onConfirm?.())
      onOpenChange(false)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed'
      toast.error(msg)
      logError(err, { context: 'ConfirmModal' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = React.useCallback(
    (next) => {
      if (next === false && isBusy) return
      onOpenChange(next)
    },
    [isBusy, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border border-border max-w-md">
        <DialogClose onClose={() => !isBusy && handleOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isBusy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
