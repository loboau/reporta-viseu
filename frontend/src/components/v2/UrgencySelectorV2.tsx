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
            className={`flex-1 aspect-square flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2 rounded-lg sm:rounded-2xl transition-all duration-200 ${
              isSelected
                ? 'scale-[1.02]'
                : 'hover:scale-[1.02] active:scale-95 shadow-sm'
            }`}
            style={{
              backgroundColor: option.bgColor,
              // Sombra lateral estilo logo quando selecionado
              boxShadow: isSelected
                ? `4px 4px 0px 0px ${option.color}40, 6px 6px 12px 0px rgba(0,0,0,0.12)`
                : undefined,
            }}
          >
            {/* Icon - proportional to category icons */}
            <div className="flex-1 flex items-center justify-center w-full">
              <CategoryIconV2
                iconPath={option.iconPath}
                alt={option.label}
                size={64}
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
            </div>
            {/* Label */}
            <span
              className="text-[11px] sm:text-sm font-semibold text-center leading-tight w-full truncate px-0.5"
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
