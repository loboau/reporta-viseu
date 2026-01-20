import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'glass-solid' | 'float' | 'elevated' | 'interactive'
  onClick?: () => void
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
}: CardProps) {
  const variantClasses = {
    default: 'card',
    glass: 'card-glass',
    'glass-solid': 'card-glass-solid',
    float: 'card-float',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
  }

  const isClickable = !!onClick

  return (
    <div
      className={`${variantClasses[variant]} ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => {
        // Don't interfere with form inputs - let them handle keyboard events normally
        const target = e.target as HTMLElement
        const isFormElement = target.tagName === 'INPUT' ||
                              target.tagName === 'TEXTAREA' ||
                              target.tagName === 'SELECT' ||
                              target.isContentEditable

        if (!isFormElement && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  )
}
