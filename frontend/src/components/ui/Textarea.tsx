import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCount?: boolean
}

export default function Textarea({
  label,
  error,
  helperText,
  showCount = false,
  maxLength,
  value = '',
  className = '',
  ...props
}: TextareaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0

  // Encouraging character count logic
  const getCharCountClass = () => {
    if (!maxLength) return 'text-gray-400'
    const percentage = (currentLength / maxLength) * 100
    if (percentage >= 95) return 'char-count-max'
    if (percentage >= 80) return 'char-count-warning'
    if (currentLength > 20) return 'char-count-good'
    return 'text-gray-400'
  }

  const getEncouragingMessage = () => {
    if (!maxLength) return null
    const percentage = (currentLength / maxLength) * 100
    if (currentLength === 0) return null
    if (currentLength < 20) return 'Continue escrevendo...'
    if (percentage < 50) return 'Ótimo início!'
    if (percentage < 80) return 'Está ficando ótimo!'
    if (percentage < 95) return 'Quase lá!'
    if (currentLength === maxLength) return 'Limite atingido'
    return null
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-viseu-dark">
            {label}
            {props.required && <span className="text-category-red ml-1">*</span>}
          </label>
          {showCount && maxLength && (
            <div className="flex items-center gap-2">
              {getEncouragingMessage() && (
                <span className="text-xs text-gray-500 italic">
                  {getEncouragingMessage()}
                </span>
              )}
              <span className={`text-xs font-medium char-count-progress ${getCharCountClass()}`}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      )}
      <textarea
        className={`textarea min-h-[120px] input-enhanced ${error ? 'input-error shake-error' : ''} ${className}`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-category-red-dark flex items-center gap-1.5">
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
