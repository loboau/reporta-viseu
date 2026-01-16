'use client'

import React, { useReducer, useCallback, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, MapPin, Navigation } from 'lucide-react'
import type { WizardStateV2, WizardActionV2, Location, CategoryV2, Photo, UrgencyV2 } from '@/types'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { isPointInViseuConcelho } from '@/lib/constants'
import { HeaderV2 } from './HeaderV2'
import { SidebarDrawer } from './SidebarDrawer'
import { BottomNavV2 } from './BottomNavV2'
import { CategoryGridV2 } from './CategoryGridV2'
import { UrgencySelectorV2 } from './UrgencySelectorV2'
import { PhotoUploadV2 } from './PhotoUploadV2'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import map
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[50vh] bg-gray-100 flex items-center justify-center">
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

// Reducer - handles all WizardActionV2 types exhaustively
function wizardReducer(state: WizardStateV2, action: WizardActionV2): WizardStateV2 {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, data: { ...state.data, location: action.payload } }
    case 'SET_CATEGORY':
      return { ...state, data: { ...state.data, category: action.payload } }
    case 'SET_DESCRIPTION':
      return { ...state, data: { ...state.data, description: action.payload } }
    case 'ADD_PHOTO':
      return { ...state, data: { ...state.data, photos: [...state.data.photos, action.payload] } }
    case 'REMOVE_PHOTO':
      return { ...state, data: { ...state.data, photos: state.data.photos.filter((p) => p.id !== action.payload) } }
    case 'SET_URGENCY':
      return { ...state, data: { ...state.data, urgency: action.payload } }
    case 'SET_ANONYMOUS':
      return { ...state, data: { ...state.data, isAnonymous: action.payload, ...(action.payload && { name: '', email: '', phone: '' }) } }
    case 'SET_NAME':
      return { ...state, data: { ...state.data, name: action.payload } }
    case 'SET_EMAIL':
      return { ...state, data: { ...state.data, email: action.payload } }
    case 'SET_PHONE':
      return { ...state, data: { ...state.data, phone: action.payload } }
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, submitError: null }
    case 'SUBMIT_SUCCESS':
      return { ...state, data: { ...state.data, reference: action.payload.reference, letter: action.payload.letter }, isSubmitting: false, isSubmitted: true }
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, submitError: action.payload }
    case 'REGENERATE_START':
      return { ...state, isSubmitting: true }
    case 'REGENERATE_SUCCESS':
      return { ...state, data: { ...state.data, letter: action.payload }, isSubmitting: false }
    case 'RESET':
      return { ...initialState, data: { ...initialState.data, location: null } }
  }
}

export default function MainPageV2() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const geolocation = useGeolocation()
  const { reverseGeocode } = useReverseGeocode()
  const addressSearch = useAddressSearch()

  // Location handling
  const handleLocationChange = useCallback(async (newLocation: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: newLocation })
    const result = await reverseGeocode(newLocation)
    if (result) {
      dispatch({ type: 'SET_LOCATION', payload: { ...newLocation, address: result.address, freguesia: result.freguesia || undefined } })
    }
  }, [reverseGeocode])

  const handleGPSClick = useCallback(() => {
    geolocation.getCurrentLocation()
  }, [geolocation])

  // When GPS location comes in
  React.useEffect(() => {
    if (geolocation.location) {
      handleLocationChange(geolocation.location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation.location])

  // Search dropdown
  React.useEffect(() => {
    setShowDropdown(addressSearch.results.length > 0 && !!addressSearch.query)
  }, [addressSearch.results, addressSearch.query])

  const handleAddressSelect = async (result: typeof addressSearch.results[0]) => {
    if (!result.isInConcelho && !isPointInViseuConcelho(result.location.lat, result.location.lng)) {
      return
    }
    await handleLocationChange(result.location)
    addressSearch.clearSearch()
    setShowDropdown(false)
  }

  // Handlers
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

  const handleNewReport = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Navigation
  const canProceed = useMemo(() => {
    return state.data.location !== null && state.data.category !== null
  }, [state.data.location, state.data.category])

  const handleNext = useCallback(() => {
    if (canProceed) {
      dispatch({ type: 'NEXT_STEP' })
    }
  }, [canProceed])

  const handleBack = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
  }, [])

  const handleTabClick = useCallback((step: number) => {
    if (step <= state.currentStep) {
      dispatch({ type: 'SET_STEP', payload: step })
    }
  }, [state.currentStep])

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <HeaderV2 onMenuClick={() => setSidebarOpen(true)} />
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewReport={handleNewReport}
      />

      {/* Map Section */}
      <div className="relative">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={addressSearch.query}
                onChange={(e) => addressSearch.setQuery(e.target.value)}
                placeholder="Pesquisar morada"
                className="w-full px-12 py-3.5 bg-transparent border-0 rounded-2xl focus:ring-0 outline-none placeholder:text-gray-400 text-gray-900"
              />
              {addressSearch.query && (
                <button
                  onClick={() => { addressSearch.clearSearch(); setShowDropdown(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Dropdown */}
            {showDropdown && (
              <div ref={dropdownRef} className="border-t border-gray-100 max-h-64 overflow-y-auto">
                {addressSearch.results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleAddressSelect(result)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 ${!result.isInConcelho ? 'opacity-50' : ''}`}
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{result.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="h-[50vh]">
          <MapContainer
            location={state.data.location}
            onLocationChange={handleLocationChange}
            className="h-full w-full"
          />
        </div>

        {/* GPS Button */}
        <button
          onClick={handleGPSClick}
          disabled={geolocation.loading}
          className="absolute bottom-24 right-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
        >
          {geolocation.loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Navigation className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Zoom Controls */}
        <div className="absolute bottom-24 right-20 z-20 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-100">+</button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
        </div>

        {/* Location Card */}
        {state.data.location && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-v2-pink rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">Localização marcada</p>
                  <p className="text-sm text-gray-500 truncate">
                    {state.data.location.address || `${state.data.location.lat.toFixed(5)}, ${state.data.location.lng.toFixed(5)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="px-4 py-6 space-y-6 max-w-xl mx-auto">

        {/* Category Selection */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Identifique o tipo de problema
          </h2>
          <CategoryGridV2
            selectedCategory={state.data.category}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">
            Descreva o problema
          </h2>
          <Textarea
            placeholder="Ex: Há um buraco grande na estrada que pode causar acidentes. Está lá há cerca de 2 semanas..."
            value={state.data.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={4}
            maxLength={1000}
            showCount
            className="resize-none border-0 bg-gray-50 rounded-xl"
          />
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Adicionar fotos (opcional)
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              As fotografias ajudam a resolver o problema mais rapidamente
            </p>
            <span className="text-sm text-gray-400">{state.data.photos.length}/5</span>
          </div>
          <PhotoUploadV2
            photos={state.data.photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        </div>

        {/* Urgency Level */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Nível de urgência
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Para emergências (acidentes, incêndios, etc.), ligue 112
            </p>
          </div>
          <UrgencySelectorV2
            selected={state.data.urgency}
            onSelect={handleUrgencyChange}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavV2
        currentStep={1}
        onTabClick={handleTabClick}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel="Seguinte"
        nextDisabled={!canProceed}
        showBack={false}
      />
    </div>
  )
}
