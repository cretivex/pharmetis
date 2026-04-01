import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  // RFQ / response statuses
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-primary/10 text-primary',
  ASSIGNED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  PENDING: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  RESPONDED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  ACCEPTED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  REJECTED: 'bg-destructive/10 text-destructive',
  CONFIRMED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  ADMIN_APPROVED: 'bg-primary/10 text-primary',
  SENT_TO_BUYER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  BUYER_ACCEPTED: 'bg-green-500/10 text-green-600 dark:text-green-400',
  BUYER_REJECTED: 'bg-destructive/10 text-destructive',
  // Product
  IN_STOCK: 'bg-green-500/10 text-green-600 dark:text-green-400',
  MADE_TO_ORDER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  OUT_OF_STOCK: 'bg-destructive/10 text-destructive',
  // Generic
  active: 'bg-green-500/10 text-green-600 dark:text-green-400',
  inactive: 'bg-muted text-muted-foreground'
}

/**
 * Shared status badge. Maps status string to theme-aware styles (works in dark/light).
 */
export default function StatusBadge({ status, label, className }) {
  const display = label ?? (typeof status === 'string' ? status.replace(/_/g, ' ') : status)
  const style = status ? STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      {display}
    </span>
  )
}
