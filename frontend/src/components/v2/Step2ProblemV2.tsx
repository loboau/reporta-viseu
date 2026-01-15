'use client'

import React, { useRef, useCallback } from 'react'
import { CategoryV2, Photo, UrgencyV2 } from '@/types'
import Textarea from '@/components/ui/Textarea'
import { CategoryGridV2 } from './CategoryGridV2'
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
  const descriptionRef = useRef<HTMLDivElement>(null)

  // Default placeholder when no category is selected
  const defaultPlaceholder = 'Selecione primeiro uma categoria acima para ver um exemplo de descrição...'
  const placeholder = category?.placeholder || defaultPlaceholder

  // Handle category selection with auto-scroll
  const handleCategorySelect = useCallback((cat: CategoryV2) => {
    onCategoryChange(cat)
    // Scroll to description section after a brief delay
    setTimeout(() => {
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [onCategoryChange])

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-44">
      {/* Category Selection */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
          Identifique o tipo de problema
        </h2>
        <CategoryGridV2
          selectedCategory={category}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Description */}
      <div ref={descriptionRef} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm scroll-mt-4">
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
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Nível de urgência
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Emergências: ligue 112
          </p>
        </div>
        <UrgencySelectorV2
          selected={urgency}
          onSelect={onUrgencyChange}
        />
      </div>
    </div>
  )
}
