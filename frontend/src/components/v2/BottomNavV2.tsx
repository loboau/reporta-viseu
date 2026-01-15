'use client'

import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'

interface BottomNavV2Props {
  currentStep: number
  onTabClick: (step: number) => void
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
  showBack?: boolean
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
}: BottomNavV2Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-pb">
      {/* Step Labels + Progress Line - More compact on mobile */}
      <div className="flex gap-1 px-4 sm:px-8 pt-2 sm:pt-4">
        {STEPS.map((step, index) => (
          <div key={step.step} className="flex-1 flex flex-col items-center gap-1">
            {/* Label - centered above progress bar */}
            <button
              onClick={() => onTabClick(step.step)}
              disabled={step.step > currentStep}
              className={`text-[10px] sm:text-sm font-medium transition-all text-center ${
                step.step === currentStep
                  ? 'text-gray-900'
                  : step.step < currentStep
                  ? 'text-gray-500 hover:text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {step.label}
            </button>
            {/* Progress segment */}
            <div
              className={`h-1 w-full rounded-full transition-all ${
                step.step <= currentStep
                  ? 'bg-v2-yellow'
                  : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons - More compact on mobile */}
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

        {/* Next/Submit Button - Centered, smaller on mobile */}
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
