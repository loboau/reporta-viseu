'use client'

import React, { useReducer, useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { WizardStateV2, WizardActionV2, ReportDataV2, Location, CategoryV2, Photo, UrgencyV2 } from '@/types'
import { generateReference } from '@/lib/generateReference'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { HeaderV2 } from './HeaderV2'
import { SidebarDrawer } from './SidebarDrawer'
import { BottomNavV2 } from './BottomNavV2'
import Step1LocationV2 from './Step1LocationV2'
import Step2ProblemV2 from './Step2ProblemV2'
import Step3SubmitV2 from './Step3SubmitV2'
import StepSuccessV2 from './StepSuccessV2'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
)

// Initial state
const initialState: WizardStateV2 = {
  currentStep: 1,
  data: {
    location: null,
    category: null,
    description: '',
    photos: [],
    urgency: 'urgente',
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
function wizardReducer(state: WizardStateV2, action: WizardActionV2): WizardStateV2 {
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

// API call to generate letter (adapted for V2)
async function generateLetter(data: ReportDataV2, reference: string): Promise<string> {
  // Map V2 urgency to V1 format for API compatibility
  const urgencyMap: Record<UrgencyV2, string> = {
    'pouco_urgente': 'baixa',
    'urgente': 'media',
    'perigoso': 'alta',
  }

  const response = await fetch('/api/generate-letter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location: data.location,
      category: data.category ? {
        ...data.category,
        icon: '',
        colorDark: data.category.color,
        colorClass: '',
        shadowClass: '',
      } : null,
      description: data.description,
      photos: data.photos,
      urgency: urgencyMap[data.urgency],
      isAnonymous: data.isAnonymous,
      name: data.name,
      email: data.email,
      phone: data.phone,
      reference,
    }),
  })

  if (!response.ok) {
    throw new Error('Erro ao gerar carta')
  }

  const result = await response.json()
  return result.letter
}

export default function WizardContainerV2() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapApi, setMapApi] = useState<{ zoomIn: () => void; zoomOut: () => void } | null>(null)
  const { reverseGeocode, loading: isGeocodingLoading } = useReverseGeocode()

  const handleMapReady = useCallback((api: { zoomIn: () => void; zoomOut: () => void }) => {
    setMapApi(api)
  }, [])

  // Validation functions
  const canProceedFromStep1 = useMemo(() => {
    return state.data.location !== null
  }, [state.data.location])

  const canProceedFromStep2 = useMemo(() => {
    return state.data.category !== null && state.data.description.trim().length > 0
  }, [state.data.category, state.data.description])

  const canProceedFromStep3 = useMemo(() => {
    return (
      state.data.name.trim() !== '' &&
      state.data.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.data.email)
    )
  }, [state.data.name, state.data.email])

  // Memoized dispatch handlers
  const handleLocationChange = useCallback(async (location: Location) => {
    // First update with basic location (lat/lng)
    dispatch({ type: 'SET_LOCATION', payload: location })

    // Then fetch address via reverse geocoding
    const result = await reverseGeocode(location)
    if (result) {
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          ...location,
          address: result.address,
          freguesia: result.freguesia || undefined,
        },
      })
    }
  }, [reverseGeocode])

  const handleCategoryChange = useCallback((category: CategoryV2) => {
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

  const handleUrgencyChange = useCallback((urgency: UrgencyV2) => {
    dispatch({ type: 'SET_URGENCY', payload: urgency })
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

  // Submit handler
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

  const handleTabClick = useCallback((step: number) => {
    if (step <= state.currentStep) {
      dispatch({ type: 'SET_STEP', payload: step })
    }
  }, [state.currentStep])

  const handleNewReport = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const handleRegenerateLetter = useCallback(async () => {
    dispatch({ type: 'REGENERATE_START' })

    try {
      const letter = await generateLetter(state.data, state.data.reference || '')
      dispatch({ type: 'REGENERATE_SUCCESS', payload: letter })
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Erro ao regenerar a carta.' })
    }
  }, [state.data])

  // Button props
  const nextButtonProps = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return {
          label: 'Seguinte',
          disabled: !canProceedFromStep1,
          isLoading: false,
        }
      case 2:
        return {
          label: 'Seguinte',
          disabled: !canProceedFromStep2,
          isLoading: false,
        }
      case 3:
        return {
          label: state.isSubmitting ? 'A gerar...' : 'Gerar Carta',
          disabled: !canProceedFromStep3 || state.isSubmitting,
          isLoading: state.isSubmitting,
        }
      default:
        return { label: 'Seguinte', disabled: false, isLoading: false }
    }
  }, [state.currentStep, state.isSubmitting, canProceedFromStep1, canProceedFromStep2, canProceedFromStep3])

  // Success screen
  if (state.isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderV2 onMenuClick={() => setSidebarOpen(true)} />
        <SidebarDrawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewReport={handleNewReport}
        />
        <main className="px-4 py-4 max-w-lg mx-auto">
          <StepSuccessV2
            data={state.data}
            onNewReport={handleNewReport}
            onRegenerateLetter={handleRegenerateLetter}
            isRegenerating={state.isSubmitting}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderV2 onMenuClick={() => setSidebarOpen(true)} />
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewReport={handleNewReport}
      />

      {/* Background Map - Only visible on Step 1 */}
      {state.currentStep === 1 && (
        <div className="fixed top-14 left-0 right-0 bottom-0 z-0">
          <MapContainer
            location={state.data.location}
            onLocationChange={handleLocationChange}
            onMapReady={handleMapReady}
            className="h-full w-full"
          />
        </div>
      )}

      {/* Step 1: Location controls (search, zoom, GPS) */}
      {state.currentStep === 1 && (
        <Step1LocationV2
          location={state.data.location}
          onLocationChange={handleLocationChange}
          mapApi={mapApi}
        />
      )}

      {/* Steps 2 & 3: Full screen white background */}
      {state.currentStep > 1 && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-10 flex flex-col items-center overflow-hidden bg-gray-50">
          {/* Scrollable Content Area */}
          <div id="step-content-scroll" className="w-full flex-1 overflow-y-auto v2-scrollbar pt-4 pb-36">
            <div className="w-full max-w-xl mx-auto px-4">
              {/* Error Message */}
              {state.submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm font-medium">
                    {state.submitError}
                  </p>
                </div>
              )}

              {/* Content Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-5">
              {/* Step 2: Problem */}
              {state.currentStep === 2 && (
                <Step2ProblemV2
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
                <Step3SubmitV2
                  data={state.data}
                  onNameChange={handleNameChange}
                  onEmailChange={handleEmailChange}
                  onPhoneChange={handlePhoneChange}
                />
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - ALWAYS fixed at bottom, same position for ALL steps */}
      <div className="fixed bottom-0 left-0 right-0 z-20 w-full">
        <div className="w-full max-w-xl mx-auto px-4 pb-4 safe-area-pb">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-float">
            <BottomNavV2
              currentStep={state.currentStep}
              onTabClick={handleTabClick}
              onBack={handleBack}
              onNext={handleNext}
              nextLabel={nextButtonProps.label}
              nextDisabled={nextButtonProps.disabled}
              isLoading={nextButtonProps.isLoading}
              showBack={state.currentStep > 1}
              location={state.data.location}
              isGeocodingLoading={isGeocodingLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
