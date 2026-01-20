'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { CategoryV2 } from '@/types'
import { categoriesV2 } from '@/lib/categoriesV2'
import { CategoryIconV2 } from './CategoryIconV2'

// Spring configuration for satisfying tap feedback
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
}

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
              <motion.button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category)}
                aria-pressed={isSelected}
                aria-label={`${category.label} - ${category.sublabel}${isSelected ? ' (selecionado)' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.92 }}
                animate={
                  isSelected && lastSelected === category.id
                    ? { scale: [1, 1.08, 1.02], transition: { duration: 0.3 } }
                    : isSelected
                    ? { scale: 1.02 }
                    : { scale: 1 }
                }
                transition={springConfig}
                className="flex-1 aspect-square flex flex-col items-center justify-between pt-2.5 pb-1.5 sm:pt-5 sm:pb-3 px-1 sm:px-2 rounded-lg sm:rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 shadow-sm"
                style={{
                  backgroundColor: category.color,
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
                <span className="text-xs sm:text-sm font-semibold text-white text-center leading-tight w-full truncate px-0.5" aria-hidden="true">
                  {category.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
})
