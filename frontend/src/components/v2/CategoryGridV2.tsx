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
            className={`transition-all duration-200 ${
              isSelected
                ? 'scale-[1.02]'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {/* Button with icon and label inside */}
            <div
              className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 p-3 transition-all shadow-sm ${
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
                size={40}
                className="brightness-0 invert"
              />
              {/* Label inside button - white text */}
              <span className="text-xs sm:text-sm font-semibold text-white text-center leading-tight">
                {category.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
