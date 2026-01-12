import React from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
  isLoading?: boolean
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Continuar',
  backLabel = 'Voltar',
  nextDisabled = false,
  isLoading = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  const steps = [
    { number: 1, label: 'Local' },
    { number: 2, label: 'Problema' },
    { number: 3, label: 'Enviar' },
  ]

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-float safe-area-bottom">
        <div className="max-w-xl mx-auto px-4 pt-4 pb-4">
          {/* Progress Bar */}
          <div className="mb-4">
            {/* Step Labels */}
            <div className="flex justify-between mb-2">
              {steps.map((step) => {
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number

                return (
                  <span
                    key={step.number}
                    className={`text-xs font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'text-viseu-dark'
                        : isCompleted
                          ? 'text-category-green'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                )
              })}
            </div>

            {/* Progress Bar Track */}
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-viseu-gold to-category-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Step Dots on the bar */}
              <div className="absolute inset-0 flex justify-between items-center">
                {steps.map((step) => {
                  const isCompleted = currentStep >= step.number

                  return (
                    <div
                      key={step.number}
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-white border-category-green'
                          : 'bg-gray-200 border-gray-300'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {!isFirstStep ? (
              <Button
                variant="outline"
                size="lg"
                onClick={onBack}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Button>
            ) : (
              <div className="w-14 sm:w-auto" />
            )}

            {/* Next/Submit Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={onNext}
              disabled={nextDisabled || isLoading}
              fullWidth
            >
              {isLoading ? (
                <>
                  <div className="spinner-sm" />
                  <span>A processar...</span>
                </>
              ) : (
                <>
                  {isLastStep && <Sparkles className="w-5 h-5" />}
                  <span>{nextLabel}</span>
                  {!isLastStep && <ChevronRight className="w-5 h-5" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
