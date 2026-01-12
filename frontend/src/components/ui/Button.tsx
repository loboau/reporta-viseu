import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses = 'transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2 touch-target'

  // Variant-specific styles (defined in globals.css)
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    icon: 'btn-icon',
  }

  // Size modifiers - only for text size, padding is in base variants
  const sizeClasses = {
    sm: 'text-sm !px-4 !py-2.5 !rounded-xl',
    md: 'text-base',
    lg: 'text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  // For icon variant, don't apply size classes
  const applySizeClass = variant !== 'icon' ? sizeClasses[size] : ''

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${applySizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
