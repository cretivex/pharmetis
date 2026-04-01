import * as React from 'react'
import { cn } from '@/lib/utils'

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default:
      'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/92 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]',
    destructive:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
    outline:
      'border border-input bg-transparent shadow-sm hover:bg-accent/80 hover:text-accent-foreground active:scale-[0.98]',
    secondary:
      'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85 active:scale-[0.98]',
    ghost: 'hover:bg-accent/60 hover:text-accent-foreground active:scale-[0.98]',
    link: 'text-primary underline-offset-4 hover:underline',
  }

  const sizes = {
    default: 'h-11 rounded-xl px-5 py-2',
    sm: 'h-9 rounded-lg px-3.5 text-xs',
    lg: 'h-12 rounded-xl px-8 text-base',
    icon: 'h-10 w-10 rounded-xl',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button }
