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
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {categoriesV2.map((category) => {
        const isSelected = selectedCategory?.id === category.id

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category)}
            className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 min-h-[100px] ${
              isSelected
                ? 'ring-2 ring-offset-2 scale-[1.02] bg-white shadow-sm'
                : 'hover:scale-[1.02] active:scale-95 hover:bg-gray-50'
            }`}
            style={{
              // Use CSS custom property for ring color
              ['--tw-ring-color' as string]: isSelected ? category.color : undefined,
            }}
          >
            {/* Icon Container */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIconV2
                iconPath={category.iconPath}
                alt={category.label}
                size={24}
                className="brightness-0 invert"
              />
            </div>
            {/* Label & Sublabel */}
            <div className="flex flex-col items-center w-full px-0.5">
              <span
                className={`text-xs font-semibold text-center leading-tight line-clamp-1 w-full ${
                  isSelected ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {category.label}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight line-clamp-1 w-full mt-0.5 hidden sm:block">
                {category.sublabel}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
