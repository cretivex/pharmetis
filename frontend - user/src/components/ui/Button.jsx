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
  const baseStyles = 'font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-primary/40 shadow-soft hover:shadow-soft-lg',
    secondary: 'bg-transparent border border-primary text-primary hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-primary/40',
    outline: 'bg-transparent border border-primary text-primary hover:bg-blue-50 hover:border-blue-600 focus-visible:ring-primary/40',
    ghost: 'bg-transparent text-slate-900 hover:bg-blue-50 hover:text-primary active:bg-blue-100/70 focus-visible:ring-primary/40',
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
