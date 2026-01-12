import React from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl
          focus:border-viseu-gold focus:ring-4 focus:ring-viseu-gold/10
          outline-none transition-all duration-200
          placeholder:text-gray-400 text-viseu-dark text-sm font-medium
          shadow-soft hover:border-gray-200 hover:shadow-soft-md"
      />
    </div>
  )
}
