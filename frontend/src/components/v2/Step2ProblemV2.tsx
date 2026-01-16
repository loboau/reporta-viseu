'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import type { CategoryV2, Photo, UrgencyV2 } from '@/types'
import Textarea from '@/components/ui/Textarea'
import { CategoryGridV2 } from './CategoryGridV2'
import { CategoryIconV2 } from './CategoryIconV2'
import { UrgencySelectorV2 } from './UrgencySelectorV2'
import { PhotoUploadV2 } from './PhotoUploadV2'

interface Step2ProblemV2Props {
  category: CategoryV2 | null
  description: string
  photos: Photo[]
  urgency: UrgencyV2
  onCategoryChange: (category: CategoryV2) => void
  onDescriptionChange: (description: string) => void
  onAddPhoto: (photo: Photo) => void
  onRemovePhoto: (id: string) => void
  onUrgencyChange: (urgency: UrgencyV2) => void
}

export default function Step2ProblemV2({
  category,
  description,
  photos,
  urgency,
  onCategoryChange,
  onDescriptionChange,
  onAddPhoto,
  onRemovePhoto,
  onUrgencyChange,
}: Step2ProblemV2Props) {
  const descriptionSectionRef = useRef<HTMLDivElement>(null)
  const previousCategoryRef = useRef<CategoryV2 | null>(null)

  // Default placeholder when no category is selected
  const defaultPlaceholder = 'Selecione primeiro uma categoria acima para ver um exemplo de descrição...'
  const placeholder = category?.placeholder || defaultPlaceholder

  // Scroll to description section when category changes (not on initial render)
  useEffect(() => {
    // Only scroll if category changed from a previous value (not initial load)
    if (category && previousCategoryRef.current !== category) {
      // Small delay to ensure DOM is updated with the category badge
      const timer = setTimeout(() => {
        if (descriptionSectionRef.current) {
          const element = descriptionSectionRef.current
          const rect = element.getBoundingClientRect()
          const headerOffset = 80 // Account for sticky header
          const targetY = window.scrollY + rect.top - headerOffset

          // Only scroll if the element is not already visible in a good position
          if (rect.top < headerOffset || rect.top > window.innerHeight * 0.4) {
            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: 'smooth',
            })
          }
        }
      }, 100)

      return () => clearTimeout(timer)
    }
    previousCategoryRef.current = category
  }, [category])

  // Handle category selection
  const handleCategorySelect = useCallback((cat: CategoryV2) => {
    onCategoryChange(cat)
  }, [onCategoryChange])

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Category Selection */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
          Identifique o tipo de problema
        </h2>
        <CategoryGridV2
          selectedCategory={category}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Selected Category Badge + Description */}
      <div ref={descriptionSectionRef} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm scroll-mt-20">
        {/* Selected category mini-badge */}
        {category && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIconV2
                iconPath={category.iconPath}
                alt={category.label}
                size={20}
                className="brightness-0 invert"
              />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-gray-900">{category.label}</span>
              <span className="text-xs text-gray-500 ml-2">{category.sublabel}</span>
            </div>
          </div>
        )}

        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
          Descreva o problema
        </h2>
        <Textarea
          placeholder={placeholder}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          maxLength={1000}
          showCount
          className="resize-none border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-v2-yellow"
        />
      </div>

      {/* Photo Upload */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Adicionar fotos
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Opcional - ajuda a resolver mais rapidamente
            </p>
          </div>
          <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0 ml-2">{photos.length}/5</span>
        </div>
        <PhotoUploadV2
          photos={photos}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
        />
      </div>

      {/* Urgency Level */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
          Nível de urgência
        </h2>
        <UrgencySelectorV2
          selected={urgency}
          onSelect={onUrgencyChange}
        />
        <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-3">
          Emergências: ligue 112
        </p>
      </div>
    </div>
  )
}
