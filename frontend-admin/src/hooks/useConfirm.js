import { useState, useCallback } from 'react'

/**
 * Hook for destructive action confirmation. Returns { open, onOpenChange, confirm }.
 * Use with <ConfirmModal open={open} onOpenChange={onOpenChange} onConfirm={confirm} ... />.
 */
export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const askConfirm = useCallback((onConfirm, options = {}) => {
    setPendingAction({ onConfirm, ...options })
    setOpen(true)
  }, [])

  const handleConfirm = useCallback(() => {
    if (pendingAction?.onConfirm) {
      pendingAction.onConfirm()
    }
    setPendingAction(null)
    setOpen(false)
  }, [pendingAction])

  const handleOpenChange = useCallback((next) => {
    if (!next) setPendingAction(null)
    setOpen(next)
  }, [])

  return {
    open,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
    askConfirm,
    title: pendingAction?.title,
    message: pendingAction?.message,
  }
}
