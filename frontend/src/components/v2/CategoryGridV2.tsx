'use client'

import { CategoryV2 } from '@/types'
import { categoriesV2 } from '@/lib/categoriesV2'
import { CategoryIconV2 } from './CategoryIconV2'

interface CategoryGridV2Props {
  selectedCategory: CategoryV2 | null
  onSelectCategory: (category: CategoryV2) => void
}

export function CategoryGridV2({ selectedCategory, onSelectCategory }: CategoryGridV2Props) {
  // Split categories into rows of 3 to match urgency selector layout
  const rows = []
  for (let i = 0; i < categoriesV2.length; i += 3) {
    rows.push(categoriesV2.slice(i, i + 3))
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 sm:gap-3">
          {row.map((category) => {
            const isSelected = selectedCategory?.id === category.id

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category)}
                className={`flex-1 aspect-square flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2 rounded-lg sm:rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'scale-[1.02]'
                    : 'hover:scale-[1.02] active:scale-95 shadow-sm'
                }`}
                style={{
                  backgroundColor: category.color,
                  // Sombra lateral estilo logo quando selecionado
                  boxShadow: isSelected
                    ? `4px 4px 0px 0px ${category.color}40, 6px 6px 12px 0px rgba(0,0,0,0.15)`
                    : undefined,
                }}
              >
                {/* Icon container */}
                <div className="flex-1 flex items-center justify-center w-full">
                  <CategoryIconV2
                    iconPath={category.iconPath}
                    alt={category.label}
                    size={64}
                    className="brightness-0 invert w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
                {/* Label */}
                <span className="text-[11px] sm:text-sm font-semibold text-white text-center leading-tight w-full truncate px-0.5">
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
