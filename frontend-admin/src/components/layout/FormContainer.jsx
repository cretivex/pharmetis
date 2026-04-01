import { cn } from '@/lib/utils'

/** Two-column form grid on md+; single column on mobile. */
export default function FormContainer({ children, className, ...rest }) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
