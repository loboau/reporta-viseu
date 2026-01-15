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
    <div className="w-full px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Step 1: Location display */}
      {currentStep === 1 && (
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-v2-green flex-shrink-0" />
          <p className="text-sm sm:text-base text-gray-700 truncate flex-1">
            {isGeocodingLoading ? (
              <span className="text-gray-400">A obter morada...</span>
            ) : location?.address ? (
              location.address
            ) : location ? (
              <span className="text-gray-400">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
            ) : (
              <span className="text-gray-400">Toque no mapa para marcar</span>
            )}
          </p>
        </div>
      )}

      {/* Progress bar + Navigation row */}
      <div className="flex items-center gap-3">
        {/* Back button - compact */}
        {showBack && currentStep > 1 && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Progress steps - minimal dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => step <= currentStep && onTabClick(step)}
              disabled={step > currentStep}
              className={`h-1.5 rounded-full transition-all ${
                step === currentStep
                  ? 'w-6 bg-v2-yellow'
                  : step < currentStep
                  ? 'w-1.5 bg-v2-green hover:bg-v2-green/80'
                  : 'w-1.5 bg-gray-200'
              }`}
              aria-label={`Passo ${step}`}
            />
          ))}
        </div>

        {/* Next button - compact */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
            nextDisabled || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-v2-yellow text-gray-900 hover:bg-yellow-400 active:scale-95'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{currentStep === 3 ? 'Gerar' : nextLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
