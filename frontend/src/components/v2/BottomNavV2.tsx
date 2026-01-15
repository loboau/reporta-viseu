'use client'

import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'
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
  // Calculate progress percentage (0%, 33%, 66%, 100%)
  const progressPercent = ((currentStep - 1) / 2) * 100

  return (
    <div className="w-full p-3 sm:p-4">
      {/* Step 1: Location display with VR yellow icon */}
      {currentStep === 1 && (
        <div className="flex items-start gap-3 mb-3 px-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 mt-0.5">
            <Image
              src="/v2/icons/Icon_Pin_Amarelo.png"
              alt="Localização"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Localização marcada</p>
            <p className="text-sm sm:text-base text-gray-700 font-medium leading-snug">
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

      {/* Progress bar - thin gradient style (yellow to green like VR logo) */}
      <div className="mb-4">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #FFC107 0%, #8BC34A 100%)',
            }}
          />
        </div>
        {/* Step labels below progress bar - flex with equal spacing */}
        <div className="flex justify-between items-center mt-2 px-1">
          {['Localização', 'Problema', 'Enviar'].map((label, index) => {
            const stepNum = index + 1
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep
            const isClickable = stepNum <= currentStep

            return (
              <button
                key={label}
                onClick={() => isClickable && onTabClick(stepNum)}
                disabled={!isClickable}
                className={`text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900'
                    : isCompleted
                    ? 'text-v2-green hover:text-v2-green/80'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation buttons - animated transition */}
      <div className="flex items-center justify-center gap-3">
        {/* Back button - slides in from left with animation */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            showBack && currentStep > 1
              ? 'w-auto opacity-100 translate-x-0'
              : 'w-0 opacity-0 -translate-x-4'
          }`}
        >
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
                       bg-gray-100 hover:bg-gray-200
                       text-gray-600 text-sm font-semibold
                       transition-all duration-200 active:scale-95
                       whitespace-nowrap"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Next/Submit button - centered, contracts when back button appears */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`flex items-center justify-center gap-2 px-8 py-2.5
                      rounded-xl text-sm font-semibold
                      transition-all duration-300 ease-out ${
            nextDisabled || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-v2-yellow text-gray-900 hover:bg-yellow-400 active:scale-[0.98]'
          } ${
            showBack && currentStep > 1 ? 'flex-1 max-w-[200px]' : 'w-full max-w-[280px]'
          }`}
          style={{
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
