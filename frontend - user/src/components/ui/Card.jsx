function Card({ children, className = '', variant = 'default', ...props }) {
  const baseStyles = 'rounded-lg'
  
  const variants = {
    default: 'bg-white border border-blue-200',
    elevated: 'bg-white border border-blue-200 shadow-lg',
    outlined: 'bg-transparent border-2 border-blue-200',
    filled: 'bg-blue-50',
  }
  
  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
