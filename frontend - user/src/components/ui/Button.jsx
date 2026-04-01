function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false,
  ...props 
}) {
  const baseStyles =
    'font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
  
  const variants = {
    primary:
      'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black focus-visible:ring-neutral-900/40 shadow-soft hover:shadow-soft-lg',
    secondary:
      'bg-transparent border border-neutral-900 text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-900/40',
    outline:
      'bg-transparent border border-neutral-900 text-neutral-900 hover:bg-neutral-100 hover:border-neutral-800 focus-visible:ring-neutral-900/40',
    ghost:
      'bg-transparent text-slate-900 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200/70 focus-visible:ring-neutral-900/40',
  }
  
  const sizes = {
    sm: 'px-4 py-2.5 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  }
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
