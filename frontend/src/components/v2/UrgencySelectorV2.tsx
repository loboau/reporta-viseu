'use client'

import { UrgencyV2 } from '@/types'
import { urgencyOptionsV2 } from '@/lib/categoriesV2'
import { CategoryIconV2 } from './CategoryIconV2'

interface UrgencySelectorV2Props {
  selected: UrgencyV2
  onSelect: (urgency: UrgencyV2) => void
}

export function UrgencySelectorV2({ selected, onSelect }: UrgencySelectorV2Props) {
  return (
    <div className="flex gap-2 sm:gap-3">
      {urgencyOptionsV2.map((option) => {
        const isSelected = selected === option.id

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
            className={`flex-1 flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-200 border-2 min-h-[88px] ${
              isSelected
                ? 'scale-[1.02] shadow-md'
                : 'border-transparent hover:scale-[1.02] active:scale-95 shadow-sm'
            }`}
            style={{
              backgroundColor: option.bgColor,
              borderColor: isSelected ? option.color : 'transparent',
            }}
          >
            {/* Icon */}
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <CategoryIconV2
                iconPath={option.iconPath}
                alt={option.label}
                size={32}
              />
            </div>
            {/* Label */}
            <span
              className="text-xs font-semibold text-center leading-tight line-clamp-1 w-full px-1"
              style={{ color: option.color }}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
