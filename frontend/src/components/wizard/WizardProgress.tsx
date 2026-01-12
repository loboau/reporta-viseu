import React from 'react'

interface WizardProgressProps {
  currentStep: number
  totalSteps?: number
}

export default function WizardProgress({
  currentStep,
  totalSteps = 3,
}: WizardProgressProps) {
  const steps = [
    { number: 1, label: 'Local' },
    { number: 2, label: 'Problema' },
    { number: 3, label: 'Enviar' },
  ]

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 py-4 mb-4">
      <div className="max-w-md mx-auto px-6">
        {/* Step Labels */}
        <div className="flex justify-between mb-3">
          {steps.map((step) => {
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number

            return (
              <div key={step.number} className="flex flex-col items-center">
                <span
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
              </div>
            )
          })}
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-viseu-gold to-category-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Step Dots on the bar */}
          <div className="absolute inset-0 flex justify-between items-center">
            {steps.map((step) => {
              const isActive = currentStep === step.number
              const isCompleted = currentStep >= step.number

              return (
                <div
                  key={step.number}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-white border-category-green'
                      : isActive
                        ? 'bg-white border-viseu-gold'
                        : 'bg-gray-200 border-gray-300'
                  } ${isActive ? 'scale-125' : ''}`}
                />
              )
            })}
          </div>
        </div>

        {/* Current Step Text */}
        <div className="text-center mt-3">
          <span className="text-xs text-gray-400">
            Passo {currentStep} de {totalSteps}
          </span>
        </div>
      </div>
    </div>
  )
}
