function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export default function PageContainer({ children, className = '', ...rest }) {
  return (
    <div
      className={cx(
        'mx-auto w-full min-w-0 max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 2xl:max-w-[1600px]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
