'use client'

import { ChevronRight, ChevronLeft, Loader2, MapPin } from 'lucide-react'
import { Location } from '@/types'

interface BottomNavV2Props {
  currentStep: number
  onTabClick: (step: number) => void
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  location?: Location | null
  isGeocodingLoading?: boolean
}

const stepLabels = [
  { id: 1, label: 'Localizacao' },
  { id: 2, label: 'Problema' },
  { id: 3, label: 'Enviar' },
]

export function BottomNavV2({
  currentStep,
  onTabClick,
  onBack,
  onNext,
  nextLabel = 'Seguinte',
  nextDisabled = false,
  isLoading = false,
  showBack = true,
  location,
  isGeocodingLoading = false,
}: BottomNavV2Props) {
  return (
    <div className="w-full p-3 sm:p-4">
      {/* Step 1: Location display - Card style matching app aesthetic */}
      {currentStep === 1 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-v2-green/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-v2-green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Localizacao marcada</p>
            <p className="text-sm sm:text-base text-gray-700 font-medium truncate">
              {isGeocodingLoading ? (
                <span className="text-gray-400 font-normal">A obter morada...</span>
              ) : location?.address ? (
                location.address
              ) : location ? (
                <span className="text-gray-400 font-normal">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
              ) : (
                <span className="text-gray-400 font-normal">Toque no mapa para marcar</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Progress tabs - Labeled step indicators matching design mockup */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 border-b border-gray-100 pb-3">
        {stepLabels.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isClickable = step.id <= currentStep

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onTabClick(step.id)}
              disabled={!isClickable}
              className={`relative text-sm font-medium transition-all duration-200 pb-1 ${
                isActive
                  ? 'text-gray-900'
                  : isCompleted
                  ? 'text-v2-green hover:text-v2-green/80 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {step.label}
              {/* Active indicator line */}
              {isActive && (
                <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-v2-yellow rounded-full" />
              )}
              {/* Completed indicator dot */}
              {isCompleted && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-v2-green rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Navigation buttons row */}
      <div className="flex items-center gap-3">
        {/* Back button - Styled to match V2 buttons */}
        {showBack && currentStep > 1 ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                       bg-gray-100 hover:bg-gray-200
                       text-gray-600 text-sm font-semibold
                       transition-all duration-200 active:scale-95
                       flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : (
          /* Spacer to maintain layout when back button is hidden */
          <div className="w-[88px] sm:w-[96px] flex-shrink-0" />
        )}

        {/* Next/Submit button - Primary CTA with V2 yellow */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3
                      rounded-xl sm:rounded-2xl text-sm font-semibold
                      transition-all duration-200 ${
            nextDisabled || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-v2-yellow text-gray-900 hover:bg-yellow-400 active:scale-[0.98] shadow-sm hover:shadow-md'
          }`}
          style={{
            // Add the signature V2 offset shadow when enabled
            boxShadow: (!nextDisabled && !isLoading)
              ? '0 2px 8px rgba(255, 193, 7, 0.3)'
              : undefined,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>A processar...</span>
            </>
          ) : (
            <>
              <span>{currentStep === 3 ? 'Gerar Carta' : nextLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
