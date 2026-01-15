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
    <div className="grid grid-cols-3 gap-4 sm:gap-5">
      {categoriesV2.map((category) => {
        const isSelected = selectedCategory?.id === category.id

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`flex flex-col items-center gap-2.5 sm:gap-3 transition-all duration-200 ${
              isSelected
                ? 'scale-[1.02]'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {/* Icon Container - Large rounded square matching V2 design reference */}
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center transition-all shadow-sm ${
                isSelected ? 'ring-3 ring-offset-2 shadow-lg' : ''
              }`}
              style={{
                backgroundColor: category.color,
                ['--tw-ring-color' as string]: isSelected ? category.color : undefined,
              }}
            >
              <CategoryIconV2
                iconPath={category.iconPath}
                alt={category.label}
                size={44}
                className="brightness-0 invert sm:scale-110"
              />
            </div>
            {/* Label - Colored to match icon background */}
            <span
              className="text-sm sm:text-base font-semibold text-center leading-tight"
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
