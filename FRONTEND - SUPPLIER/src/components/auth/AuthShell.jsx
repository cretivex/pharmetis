import { cn } from '@/lib/utils'

const WIDTH = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

/**
 * Auth / onboarding shell: centered (default) or split brand + form (lg+).
 * @param {'center' | 'split'} variant
 */
export function AuthShell({ children, maxWidth = 'md', variant = 'center', className, brandAside }) {
  if (variant === 'split' && brandAside) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-muted/30 dark:bg-background">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_100%_0%,hsl(var(--primary)/0.08),transparent_55%)]"
          aria-hidden
        />
        <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-950 px-10 py-12 text-primary-foreground lg:flex xl:px-14 xl:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden
            />
            <div className="relative">{brandAside}</div>
          </aside>
          <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8 md:py-14">
            <div className={cn('w-full animate-fade-in', WIDTH[maxWidth] || WIDTH.md, 'mx-auto', className)}>
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-muted/40 dark:bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.14),transparent_50%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-muted/40 dark:to-muted/15"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6 md:py-14">
        <div className={cn('w-full animate-fade-in', WIDTH[maxWidth] || WIDTH.md, className)}>{children}</div>
      </div>
    </div>
  )
}

export function AuthBrandHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8 text-center lg:text-left">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10 transition duration-300 hover:scale-[1.02] hover:shadow-md lg:mx-0">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      ) : null}
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
    </div>
  )
}

/** Default marketing column for split auth (conversion-focused) */
export function AuthSplitBrandDefault() {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">Pharmetis</p>
        <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          Supplier workspace built for B2B pharma deals
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/85">
          Quote faster, keep buyers aligned, and grow your catalogue in one calm, focused portal.
        </p>
      </div>
      <ul className="mt-12 space-y-4 text-sm text-primary-foreground/95">
        {[
          'Respond to RFQs with structured pricing and line items',
          'Publish and manage your product catalogue',
          'Track negotiation status and buyer messages',
        ].map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
              ✓
            </span>
            <span className="leading-snug">{line}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-primary-foreground/60">Secure session · Same APIs as production</p>
    </>
  )
}
