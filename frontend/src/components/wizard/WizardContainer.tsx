'use client'

import React, { useReducer, useCallback, useMemo } from 'react'
import { WizardState, WizardAction, ReportData, Location, Category, Photo, Urgency } from '@/types'
import { generateReference } from '@/lib/generateReference'
import WizardNavigation from './WizardNavigation'
import Step1Location from './Step1Location'
import Step2Problem from './Step2Problem'
import Step3Submit from './Step3Submit'
import StepSuccess from './StepSuccess'

// Initial state
const initialState: WizardState = {
  currentStep: 1,
  data: {
    location: null,
    category: null,
    description: '',
    photos: [],
    urgency: 'media',
    isAnonymous: false,
    name: '',
    email: '',
    phone: '',
  },
  isSubmitting: false,
  isSubmitted: false,
  submitError: null,
}

// Reducer function
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_LOCATION':
      return {
        ...state,
        data: { ...state.data, location: action.payload },
      }

    case 'SET_CATEGORY':
      return {
        ...state,
        data: { ...state.data, category: action.payload },
      }

    case 'SET_DESCRIPTION':
      return {
        ...state,
        data: { ...state.data, description: action.payload },
      }

    case 'ADD_PHOTO':
      return {
        ...state,
        data: {
          ...state.data,
          photos: [...state.data.photos, action.payload],
        },
      }

    case 'REMOVE_PHOTO':
      return {
        ...state,
        data: {
          ...state.data,
          photos: state.data.photos.filter((p) => p.id !== action.payload),
        },
      }

    case 'SET_URGENCY':
      return {
        ...state,
        data: { ...state.data, urgency: action.payload },
      }

    case 'SET_ANONYMOUS':
      return {
        ...state,
        data: {
          ...state.data,
          isAnonymous: action.payload,
          ...(action.payload && {
            name: '',
            email: '',
            phone: '',
          }),
        },
      }

    case 'SET_NAME':
      return {
        ...state,
        data: { ...state.data, name: action.payload },
      }

    case 'SET_EMAIL':
      return {
        ...state,
        data: { ...state.data, email: action.payload },
      }

    case 'SET_PHONE':
      return {
        ...state,
        data: { ...state.data, phone: action.payload },
      }

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 3),
      }

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      }

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }

    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      }

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          reference: action.payload.reference,
          letter: action.payload.letter,
        },
        isSubmitting: false,
        isSubmitted: true,
      }

    case 'REGENERATE_START':
      return {
        ...state,
        isSubmitting: true,
      }

    case 'REGENERATE_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          letter: action.payload,
        },
        isSubmitting: false,
      }

    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      }

    case 'RESET':
      return {
        ...initialState,
        data: {
          ...initialState.data,
          location: null,
        },
      }

    default:
      return state
  }
}

// API call to generate letter
async function generateLetter(data: ReportData, reference: string): Promise<string> {
  const response = await fetch('/api/generate-letter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      reference,
    }),
  })

  if (!response.ok) {
    throw new Error('Erro ao gerar carta')
  }

  const result = await response.json()
  return result.letter
}

export default function WizardContainer() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  // Validation functions - memoized
  const canProceedFromStep1 = useMemo(() => {
    return state.data.location !== null
  }, [state.data.location])

  const canProceedFromStep2 = useMemo(() => {
    return state.data.category !== null
  }, [state.data.category])

  const canProceedFromStep3 = useMemo(() => {
    if (state.data.isAnonymous) {
      return true
    }
    return (
      state.data.name.trim() !== '' &&
      state.data.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.data.email)
    )
  }, [state.data.isAnonymous, state.data.name, state.data.email])

  // Memoized dispatch handlers to prevent unnecessary re-renders
  const handleLocationChange = useCallback((location: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: location })
  }, [])

  const handleCategoryChange = useCallback((category: Category) => {
    dispatch({ type: 'SET_CATEGORY', payload: category })
  }, [])

  const handleDescriptionChange = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description })
  }, [])

  const handleAddPhoto = useCallback((photo: Photo) => {
    dispatch({ type: 'ADD_PHOTO', payload: photo })
  }, [])

  const handleRemovePhoto = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PHOTO', payload: id })
  }, [])

  const handleUrgencyChange = useCallback((urgency: Urgency) => {
    dispatch({ type: 'SET_URGENCY', payload: urgency })
  }, [])

  const handleAnonymousChange = useCallback((isAnonymous: boolean) => {
    dispatch({ type: 'SET_ANONYMOUS', payload: isAnonymous })
  }, [])

  const handleNameChange = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name })
  }, [])

  const handleEmailChange = useCallback((email: string) => {
    dispatch({ type: 'SET_EMAIL', payload: email })
  }, [])

  const handlePhoneChange = useCallback((phone: string) => {
    dispatch({ type: 'SET_PHONE', payload: phone })
  }, [])

  // Submit handler with letter generation
  const handleSubmit = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' })

    try {
      const reference = generateReference()
      const letter = await generateLetter(state.data, reference)

      dispatch({
        type: 'SUBMIT_SUCCESS',
        payload: { reference, letter },
      })
    } catch (error) {
      dispatch({
        type: 'SUBMIT_ERROR',
        payload: 'Erro ao gerar a carta. Por favor tente novamente.',
      })
    }
  }, [state.data])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (state.currentStep === 1 && canProceedFromStep1) {
      dispatch({ type: 'NEXT_STEP' })
    } else if (state.currentStep === 2 && canProceedFromStep2) {
      dispatch({ type: 'NEXT_STEP' })
    } else if (state.currentStep === 3 && canProceedFromStep3) {
      handleSubmit()
    }
  }, [state.currentStep, canProceedFromStep1, canProceedFromStep2, canProceedFromStep3, handleSubmit])

  const handleBack = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
  }, [])

  const handleNewReport = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Regenerate letter handler
  const handleRegenerateLetter = useCallback(async () => {
    dispatch({ type: 'REGENERATE_START' })

    try {
      const letter = await generateLetter(state.data, state.data.reference || '')
      dispatch({ type: 'REGENERATE_SUCCESS', payload: letter })
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Erro ao regenerar a carta.' })
    }
  }, [state.data])

  // Get next button label and disabled state - memoized (must be before conditional return)
  const nextButtonProps = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return {
          label: 'Reporta',
          disabled: !canProceedFromStep1,
          isLoading: false,
        }
      case 2:
        return {
          label: 'Reporta',
          disabled: !canProceedFromStep2,
          isLoading: false,
        }
      case 3:
        return {
          label: state.isSubmitting ? 'A gerar carta...' : 'Gerar Carta',
          disabled: !canProceedFromStep3 || state.isSubmitting,
          isLoading: state.isSubmitting,
        }
      default:
        return { label: 'Reporta', disabled: false, isLoading: false }
    }
  }, [state.currentStep, state.isSubmitting, canProceedFromStep1, canProceedFromStep2, canProceedFromStep3])

  // If submitted, show success screen
  if (state.isSubmitted) {
    return (
      <div className="pb-8 px-4 sm:px-0">
        <StepSuccess
          data={state.data}
          onNewReport={handleNewReport}
          onRegenerateLetter={handleRegenerateLetter}
          isRegenerating={state.isSubmitting}
        />
      </div>
    )
  }

  return (
    <div className={state.currentStep === 1 ? '' : 'pb-36 pt-4'}>
      {/* Step Content */}
      <div className={state.currentStep === 1 ? '' : 'px-4 sm:px-0'}>
        {/* Error Message */}
        {state.submitError && (
          <div className="mb-4 p-4 bg-category-red/10 border border-category-red/30 rounded-2xl animate-fade-in">
            <p className="text-category-red-dark text-sm font-medium">
              {state.submitError}
            </p>
          </div>
        )}

        {/* Step 1: Location */}
        {state.currentStep === 1 && (
          <Step1Location
            location={state.data.location}
            onLocationChange={handleLocationChange}
          />
        )}

        {/* Step 2: Problem */}
        {state.currentStep === 2 && (
          <Step2Problem
            category={state.data.category}
            description={state.data.description}
            photos={state.data.photos}
            urgency={state.data.urgency}
            onCategoryChange={handleCategoryChange}
            onDescriptionChange={handleDescriptionChange}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onUrgencyChange={handleUrgencyChange}
          />
        )}

        {/* Step 3: Submit */}
        {state.currentStep === 3 && (
          <Step3Submit
            data={state.data}
            onAnonymousChange={handleAnonymousChange}
            onNameChange={handleNameChange}
            onEmailChange={handleEmailChange}
            onPhoneChange={handlePhoneChange}
          />
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <WizardNavigation
        currentStep={state.currentStep}
        totalSteps={3}
        onNext={handleNext}
        onBack={handleBack}
        nextLabel={nextButtonProps.label}
        nextDisabled={nextButtonProps.disabled}
        isLoading={nextButtonProps.isLoading}
      />
    </div>
  )
}
