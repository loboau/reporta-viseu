'use client'

import React, { useRef, useCallback } from 'react'
import { CategoryV2, Photo, UrgencyV2 } from '@/types'
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
  const descriptionRef = useRef<HTMLDivElement>(null)

  // Default placeholder when no category is selected
  const defaultPlaceholder = 'Selecione primeiro uma categoria acima para ver um exemplo de descrição...'
  const placeholder = category?.placeholder || defaultPlaceholder

  // Very smooth, calm scroll animation - works with custom scroll container
  const smoothScrollTo = useCallback((element: HTMLElement, targetY: number, duration: number = 1200) => {
    const startY = element.scrollTop
    const difference = targetY - startY
    const startTime = performance.now()

    // Ease-in-out sine for an extra calm, gentle scroll
    const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutSine(progress)

      element.scrollTop = startY + difference * easedProgress

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }, [])

  // Handle category selection with precise auto-scroll
  const handleCategorySelect = useCallback((cat: CategoryV2) => {
    onCategoryChange(cat)

    // Multi-frame delay ensures React updates DOM and browser completes layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (descriptionRef.current) {
            // Find the scroll container (either custom container or window)
            const scrollContainer = document.getElementById('step-content-scroll')

            if (scrollContainer) {
              // Custom scroll container - calculate relative position
              const containerRect = scrollContainer.getBoundingClientRect()
              const elementRect = descriptionRef.current.getBoundingClientRect()
              const targetY = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - 16

              // Very calm, slow scroll animation over 1200ms
              smoothScrollTo(scrollContainer, targetY, 1200)
            } else {
              // Fallback to window scroll
              const rect = descriptionRef.current.getBoundingClientRect()
              const targetY = window.scrollY + rect.top - 64
              window.scrollTo({ top: targetY, behavior: 'smooth' })
            }
          }
        }, 100) // 100ms delay ensures layout is stable after category badge renders
      })
    })
  }, [onCategoryChange, smoothScrollTo])

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
      <div ref={descriptionRef} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm scroll-mt-16">
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
