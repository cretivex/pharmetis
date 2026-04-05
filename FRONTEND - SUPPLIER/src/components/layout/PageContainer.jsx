import { cn } from '@/lib/utils'

export default function PageContainer({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 max-w-7xl 2xl:max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
