import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div
      className={`inline-block border-gray-200 border-t-viseu-gold rounded-full animate-spin-slow ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="A carregar"
    >
      <span className="sr-only">A carregar...</span>
    </div>
  )
}
