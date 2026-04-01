function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function ResponsiveTable({ children, className = '', ...rest }) {
  return (
    <div
      className={cx(
        'w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white [-webkit-overflow-scrolling:touch]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
