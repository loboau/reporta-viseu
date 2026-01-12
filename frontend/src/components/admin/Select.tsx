import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl
        focus:border-viseu-gold focus:ring-4 focus:ring-viseu-gold/10
        outline-none transition-all duration-200
        text-viseu-dark text-sm font-medium
        shadow-soft hover:border-gray-200 hover:shadow-soft-md
        ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
