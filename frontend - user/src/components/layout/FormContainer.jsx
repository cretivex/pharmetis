function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function FormContainer({ children, className = '', ...rest }) {
  return (
    <div
      className={cx('grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
