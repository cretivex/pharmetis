export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  innerClassName = '',
  align = 'left',
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className={`mx-auto max-w-6xl px-4 sm:px-5 lg:px-6 ${innerClassName}`}>
        {(eyebrow || title || subtitle) && (
          <div
            className={
              align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'
            }
          >
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand sm:text-xs">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.6rem] md:text-[1.75rem]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-1.5 text-sm leading-snug text-slate-600 sm:text-[0.9375rem] ${align === 'center' ? '' : 'max-w-xl'}`}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
