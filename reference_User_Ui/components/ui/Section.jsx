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
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${innerClassName}`}>
        {(eyebrow || title || subtitle) && (
          <div
            className={
              align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'
            }
          >
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
            )}
            {title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-3 text-lg text-slate-600 ${align === 'center' ? '' : 'max-w-2xl'}`}
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
