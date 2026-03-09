import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * Shared form field: label (uppercase) + input/textarea + hint + error.
 */
export function FormField({
  name,
  label,
  error,
  required,
  className,
  children,
  hint
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={name ? `${name}-error` : undefined} className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

/**
 * Form input with label and error support.
 */
export const FormInput = React.forwardRef(
  ({ name, label, error, required, hint, className, ...props }, ref) => (
    <FormField name={name} label={label} error={error} required={required} hint={hint}>
      <Input
        ref={ref}
        id={name}
        name={name}
        className={cn(
          'w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30',
          error && 'border-destructive'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
    </FormField>
  )
)
FormInput.displayName = 'FormInput'

/**
 * Form textarea with label and error support.
 */
export const FormTextarea = React.forwardRef(
  ({ name, label, error, required, hint, className, ...props }, ref) => (
    <FormField name={name} label={label} error={error} required={required} hint={hint}>
      <Textarea
        ref={ref}
        id={name}
        name={name}
        className={cn(
          'w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px]',
          error && 'border-destructive'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
    </FormField>
  )
)
FormTextarea.displayName = 'FormTextarea'
