'use client'

import { ChevronRight, ChevronLeft, Loader2, Target } from 'lucide-react'
import { Location } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface BottomNavV2Props {
  currentStep: number
  onTabClick: (step: number) => void
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
  // Step 1 specific props for location info
  location?: Location | null
  isGeocodingLoading?: boolean
}

const STEPS = [
  { step: 1, label: 'Localização' },
  { step: 2, label: 'Problema' },
  { step: 3, label: 'Enviar' },
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
    <div className="w-full">
      {/* Step Labels */}
      <div className="flex px-4 sm:px-8 pt-2 sm:pt-4">
        {STEPS.map((step) => (
          <button
            key={step.step}
            onClick={() => onTabClick(step.step)}
            disabled={step.step > currentStep}
            className={`flex-1 text-[10px] sm:text-sm font-medium transition-all text-center ${
              step.step === currentStep
                ? 'text-gray-900'
                : step.step < currentStep
                ? 'text-gray-500 hover:text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Continuous Progress Bar - Green to Yellow gradient */}
      <div className="px-4 sm:px-8 mt-1.5">
        <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(currentStep / 3) * 100}%`,
              background: 'linear-gradient(90deg, #ffca05 0%, #8dc63f 100%)',
            }}
          />
        </div>
      </div>

      {/* Step 1: Location Info Row */}
      {currentStep === 1 && (
        <div className="px-4 sm:px-6 pt-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {location ? (
              <>
                {/* R Logo Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/v2/logos/Viseu_Reporta_Símbolo_R.png"
                    alt="Localização"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Localização marcada
                  </h3>
                  {isGeocodingLoading ? (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
                      <LoadingSpinner size="sm" />
                      A obter morada...
                    </div>
                  ) : location.address ? (
                    <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                      {location.address}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                    Toque no mapa ou pesquise
                  </h3>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-2 pb-2 sm:pt-3 sm:pb-4">
        {/* Back Button - Only show if not first step */}
        {showBack && currentStep > 1 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm text-gray-600 font-medium rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Voltar</span>
          </button>
        )}

        {/* Next/Submit Button */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`flex items-center gap-1 sm:gap-2 px-5 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-base font-semibold transition-all ${
            nextDisabled || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-v2-yellow text-gray-900 hover:bg-yellow-400 active:scale-95 shadow-sm'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span className="hidden sm:inline">A processar...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
