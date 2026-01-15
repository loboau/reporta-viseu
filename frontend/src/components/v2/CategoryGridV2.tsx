'use client'

import { CategoryV2 } from '@/types'
import { categoriesV2 } from '@/lib/categoriesV2'
import { CategoryIconV2 } from './CategoryIconV2'

interface CategoryGridV2Props {
  selectedCategory: CategoryV2 | null
  onSelectCategory: (category: CategoryV2) => void
}

export function CategoryGridV2({ selectedCategory, onSelectCategory }: CategoryGridV2Props) {
  return (
    // Minimal gap (4px mobile, 12px desktop) to maximize button size while maintaining visual separation
    <div className="grid grid-cols-3 gap-1 sm:gap-3">
      {categoriesV2.map((category) => {
        const isSelected = selectedCategory?.id === category.id

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`transition-all duration-200 ${
              isSelected
                ? 'scale-[1.02]'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {/* Square button that fills available grid cell space */}
            <div
              className={`w-full aspect-square rounded-lg sm:rounded-2xl flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2 transition-all ${
                isSelected ? '' : 'shadow-sm'
              }`}
              style={{
                backgroundColor: category.color,
                // Sombra lateral estilo logo quando selecionado
                boxShadow: isSelected
                  ? `4px 4px 0px 0px ${category.color}40, 6px 6px 12px 0px rgba(0,0,0,0.15)`
                  : undefined,
              }}
            >
              {/* Icon container - larger icons for better visibility */}
              <div className="flex-1 flex items-center justify-center w-full">
                <CategoryIconV2
                  iconPath={category.iconPath}
                  alt={category.label}
                  size={64}
                  className="brightness-0 invert w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              {/* Label - slightly larger text for readability */}
              <span className="text-[11px] sm:text-sm font-semibold text-white text-center leading-tight w-full truncate px-0.5">
                {category.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
