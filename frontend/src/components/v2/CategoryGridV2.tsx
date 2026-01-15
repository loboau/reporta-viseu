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
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {categoriesV2.map((category) => {
        const isSelected = selectedCategory?.id === category.id

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`flex flex-col items-center gap-2 transition-all duration-200 ${
              isSelected
                ? 'scale-[1.02]'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {/* Icon Container - Larger rounded square matching design */}
            <div
              className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all ${
                isSelected ? 'ring-2 ring-offset-2 shadow-md' : ''
              }`}
              style={{
                backgroundColor: category.color,
                ['--tw-ring-color' as string]: isSelected ? category.color : undefined,
              }}
            >
              <CategoryIconV2
                iconPath={category.iconPath}
                alt={category.label}
                size={32}
                className="brightness-0 invert sm:scale-110"
              />
            </div>
            {/* Label - Colored to match icon */}
            <span
              className="text-xs sm:text-sm font-semibold text-center leading-tight"
              style={{ color: category.color }}
            >
              {category.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
