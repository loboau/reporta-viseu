'use client'

import React, { memo, useMemo, useCallback } from 'react'
import type { CategoryV2 } from '@/types'
import { categoriesV2 } from '@/lib/categoriesV2'
import { CategoryIconV2 } from './CategoryIconV2'

interface CategoryGridV2Props {
  selectedCategory: CategoryV2 | null
  onSelectCategory: (category: CategoryV2) => void
}

export const CategoryGridV2 = memo(function CategoryGridV2({ selectedCategory, onSelectCategory }: CategoryGridV2Props) {
  const [lastSelected, setLastSelected] = React.useState<string | null>(null)

  // Split categories into rows of 3 to match urgency selector layout - memoized
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < categoriesV2.length; i += 3) {
      result.push(categoriesV2.slice(i, i + 3))
    }
    return result
  }, [])

  const handleSelect = useCallback((category: CategoryV2) => {
    setLastSelected(category.id)
    onSelectCategory(category)
  }, [onSelectCategory])

  return (
    <div className="space-y-2 sm:space-y-3" role="group" aria-label="Selecione a categoria do problema">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 sm:gap-3">
          {row.map((category) => {
            const isSelected = selectedCategory?.id === category.id

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category)}
                aria-pressed={isSelected}
                aria-label={`${category.label} - ${category.sublabel}${isSelected ? ' (selecionado)' : ''}`}
                className={`flex-1 aspect-square flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2 rounded-lg sm:rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 ${
                  isSelected && lastSelected === category.id
                    ? 'category-selected-pop'
                    : isSelected
                    ? 'scale-[1.02]'
                    : 'hover:scale-[1.02] active:scale-95 shadow-sm transition-all duration-200'
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
                <div className="flex-1 flex items-center justify-center w-full" aria-hidden="true">
                  <CategoryIconV2
                    iconPath={category.iconPath}
                    alt=""
                    size={64}
                    className="brightness-0 invert w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
                {/* Label */}
                <span className="text-[11px] sm:text-sm font-semibold text-white text-center leading-tight w-full truncate px-0.5" aria-hidden="true">
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
})
