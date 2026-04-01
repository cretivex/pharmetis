import { cn } from '@/lib/utils'

/** Dashboard / listing stat cards: 1 col mobile, 2 tablet, 3–4 desktop. */
export default function CardGrid({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
