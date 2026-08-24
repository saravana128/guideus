import React from 'react'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  outline: 'btn border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
}

function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
