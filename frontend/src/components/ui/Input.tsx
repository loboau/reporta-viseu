import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'pill'
}

export default function Input({
  label,
  error,
  helperText,
  variant = 'default',
  className = '',
  ...props
}: InputProps) {
  const inputClasses = variant === 'pill' ? 'input-pill' : 'input'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-viseu-dark mb-2">
          {label}
          {props.required && <span className="text-category-red ml-1">*</span>}
        </label>
      )}
      <input
        className={`${inputClasses} input-enhanced ${error ? 'input-error shake-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-category-red-dark flex items-center gap-1.5 shake-error">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
