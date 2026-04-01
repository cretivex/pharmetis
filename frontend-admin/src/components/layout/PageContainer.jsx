import { cn } from '@/lib/utils'

/**
 * Max-width page shell for dashboard and list views.
 * Prevents horizontal overflow; pairs with sidebar layouts.
 */
export default function PageContainer({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8 2xl:max-w-[1600px]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
