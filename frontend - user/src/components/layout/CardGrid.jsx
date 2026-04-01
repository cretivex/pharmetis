function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function CardGrid({ children, className = '', ...rest }) {
  return (
    <div
      className={cx(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
