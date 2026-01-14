'use client'

import { ChevronRight, Loader2 } from 'lucide-react'

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

const TABS = [
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
      {/* Tabs */}
      <div className="flex justify-center border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.step}
            onClick={() => onTabClick(tab.step)}
            disabled={tab.step > currentStep}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              tab.step === currentStep
                ? 'text-gray-900'
                : tab.step < currentStep
                ? 'text-gray-500 hover:text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            {tab.label}
            {/* Active indicator */}
            {tab.step === currentStep && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back Button */}
        {showBack && currentStep > 1 ? (
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-gray-600 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Voltar
          </button>
        ) : (
          <div /> // Spacer
        )}

        {/* Next/Submit Button */}
        <button
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
            nextDisabled || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-v2-yellow text-gray-900 hover:bg-yellow-400 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>A processar...</span>
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
