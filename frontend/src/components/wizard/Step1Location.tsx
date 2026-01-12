'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, X, Target, ChevronDown, Eye, AlertTriangle } from 'lucide-react'
import { Location } from '@/types'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { freguesias } from '@/lib/freguesias'
import { isPointInViseuConcelho } from '@/lib/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">A carregar mapa...</p>
        </div>
      </div>
    ),
  }
)

interface Step1LocationProps {
  location: Location | null
  onLocationChange: (location: Location) => void
}

export default function Step1Location({
  location,
  onLocationChange,
}: Step1LocationProps) {
  const [selectedFreguesia, setSelectedFreguesia] = useState<string>(
    location?.freguesia || ''
  )
  const [showDropdown, setShowDropdown] = useState(false)
  const [showFreguesiaDropdown, setShowFreguesiaDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const freguesiaDropdownRef = useRef<HTMLDivElement>(null)

  // Zoom triggers - increment to trigger zoom (fallback method)
  const [zoomInTrigger, setZoomInTrigger] = useState(0)
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0)

  // Map API ref for direct zoom control
  const mapApiRef = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null)

  // Callback when map is ready - store the API
  const handleMapReady = (api: { zoomIn: () => void; zoomOut: () => void }) => {
    mapApiRef.current = api
  }

  // Zoom handlers - use direct API if available, fallback to triggers
  const handleZoomIn = () => {
    if (mapApiRef.current) {
      mapApiRef.current.zoomIn()
    } else {
      setZoomInTrigger(prev => prev + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapApiRef.current) {
      mapApiRef.current.zoomOut()
    } else {
      setZoomOutTrigger(prev => prev + 1)
    }
  }

  // Open Google Street View
  const openStreetView = () => {
    if (location) {
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`
      window.open(url, '_blank')
    }
  }

  const geolocation = useGeolocation()
  const { reverseGeocode, loading: geocodeLoading } = useReverseGeocode()
  const addressSearch = useAddressSearch()

  // Handle GPS location
  useEffect(() => {
    if (geolocation.location) {
      handleLocationChange(geolocation.location)
    }
  }, [geolocation.location])

  // Show/hide dropdown based on search results
  useEffect(() => {
    if (addressSearch.results.length > 0 && addressSearch.query) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [addressSearch.results, addressSearch.query])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
      if (
        freguesiaDropdownRef.current &&
        !freguesiaDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFreguesiaDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationChange = useCallback(async (newLocation: Location) => {
    onLocationChange({
      ...newLocation,
      freguesia: selectedFreguesia || undefined,
    })

    const result = await reverseGeocode(newLocation)
    if (result) {
      onLocationChange({
        ...newLocation,
        address: result.address,
        freguesia: selectedFreguesia || result.freguesia || undefined,
      })
    }
  }, [onLocationChange, reverseGeocode, selectedFreguesia])

  const handleFrequesiaChange = (freguesia: string) => {
    setSelectedFreguesia(freguesia)
    setShowFreguesiaDropdown(false)
    if (location) {
      onLocationChange({
        ...location,
        freguesia: freguesia || undefined,
      })
    }
  }

  const [outOfBoundsError, setOutOfBoundsError] = useState<string | null>(null)

  const handleAddressSelect = async (result: typeof addressSearch.results[0]) => {
    // Verificar se o local está dentro do concelho
    if (!result.isInConcelho && !isPointInViseuConcelho(result.location.lat, result.location.lng)) {
      setOutOfBoundsError('Este local está fora do Concelho de Viseu')
      setTimeout(() => setOutOfBoundsError(null), 3000)
      return
    }

    await handleLocationChange(result.location)
    addressSearch.clearSearch()
    setShowDropdown(false)
    setOutOfBoundsError(null)
  }

  return (
    <div className="fixed inset-0 w-full animate-fade-in z-10">
      {/* Fullscreen Map Container */}
      <div className="absolute inset-0">
        <MapContainer
          location={location}
          onLocationChange={handleLocationChange}
          className="h-full w-full"
          zoomInTrigger={zoomInTrigger}
          zoomOutTrigger={zoomOutTrigger}
          onMapReady={handleMapReady}
        />
      </div>

      {/* Floating Search Card - Top (below header) */}
      <div className="absolute top-20 sm:top-24 left-4 right-4 z-20 max-w-xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-float p-2 border border-white/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={addressSearch.query}
              onChange={(e) => addressSearch.setQuery(e.target.value)}
              placeholder="Pesquisar morada ou rua..."
              className="w-full px-12 py-3.5 bg-transparent border-0 rounded-xl
                         focus:ring-0 outline-none
                         placeholder:text-gray-400 text-viseu-dark text-base font-medium"
            />
            {addressSearch.query ? (
              <button
                type="button"
                onClick={() => {
                  addressSearch.clearSearch()
                  setShowDropdown(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8
                           flex items-center justify-center rounded-full
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100
                           transition-all"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              addressSearch.loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="mt-2 border-t border-gray-100 max-h-64 overflow-y-auto"
            >
              {addressSearch.loading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-gray-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">A pesquisar...</span>
                </div>
              ) : addressSearch.results.length > 0 ? (
                <ul className="py-2">
                  {addressSearch.results.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleAddressSelect(result)}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 group
                                   ${result.isInConcelho ? 'hover:bg-viseu-gold/5' : 'hover:bg-red-50 opacity-60'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                        ${result.isInConcelho
                                          ? 'bg-category-blue/10 group-hover:bg-category-blue/20'
                                          : 'bg-red-100 group-hover:bg-red-200'}`}>
                          {result.isInConcelho ? (
                            <MapPin className="w-4 h-4 text-category-blue" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <span className={`text-sm leading-tight block
                                           ${result.isInConcelho
                                             ? 'text-gray-700 group-hover:text-viseu-dark'
                                             : 'text-gray-500'}`}>
                            {result.displayName}
                          </span>
                          {!result.isInConcelho && (
                            <span className="text-xs text-red-500 mt-0.5 block">
                              Fora do Concelho de Viseu
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : addressSearch.query.length >= 3 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhum resultado encontrado
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Floating Map Controls - Right Side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div className="map-control-group flex flex-col">
          <button
            type="button"
            className="map-control-btn border-b border-gray-100"
            onClick={handleZoomIn}
            aria-label="Aumentar zoom"
          >
            <span className="text-xl font-medium">+</span>
          </button>
          <button
            type="button"
            className="map-control-btn border-b border-gray-100"
            onClick={handleZoomOut}
            aria-label="Diminuir zoom"
          >
            <span className="text-xl font-medium">−</span>
          </button>
          <button
            type="button"
            className="map-control-btn border-b border-gray-100"
            onClick={geolocation.getCurrentLocation}
            disabled={geolocation.loading}
            aria-label="Usar localização atual"
          >
            {geolocation.loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </button>
          {/* Street View Button - only visible when location is set */}
          {location && (
            <button
              type="button"
              className="map-control-btn"
              onClick={openStreetView}
              aria-label="Ver no Google Street View"
              title="Ver no Google Street View"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating GPS Button - Left Side (Mobile) */}
      <div className="absolute left-4 bottom-64 z-10 sm:hidden">
        <button
          type="button"
          onClick={geolocation.getCurrentLocation}
          disabled={geolocation.loading}
          className="w-14 h-14 bg-white rounded-2xl shadow-float flex items-center justify-center
                     transition-all hover:scale-105 active:scale-95 touch-target"
          aria-label="Usar minha localização"
        >
          {geolocation.loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Navigation className="w-6 h-6 text-category-blue" />
          )}
        </button>
      </div>

      {/* Location Info Card - Bottom (above navigation with progress bar) */}
      <div className="absolute bottom-40 left-4 right-4 z-20 max-w-xl mx-auto">
        {location ? (
          <div className="location-card animate-slide-up">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-blue">
                <MapPin className="w-7 h-7 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-viseu-dark">
                    Localização marcada
                  </h3>
                  <div className="badge badge-success">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    OK
                  </div>
                </div>

                {geocodeLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    A obter morada...
                  </div>
                ) : (
                  <>
                    {location.address && (
                      <p className="text-sm text-gray-600 mb-1.5 line-clamp-2">
                        {location.address}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </>
                )}

                {/* Street View Link */}
                <button
                  type="button"
                  onClick={openStreetView}
                  className="mt-2 flex items-center gap-2 text-sm text-category-blue hover:text-category-blue-dark transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver no Google Street View</span>
                </button>

                {/* Freguesia Selector */}
                <div className="mt-3 relative" ref={freguesiaDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowFreguesiaDropdown(!showFreguesiaDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl
                               text-sm text-gray-600 hover:bg-gray-100 transition-colors w-full"
                  >
                    <span className="flex-1 text-left truncate">
                      {selectedFreguesia || 'Selecionar freguesia (opcional)'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFreguesiaDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showFreguesiaDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-float
                                    max-h-48 overflow-y-auto border border-gray-100 z-30">
                      <button
                        type="button"
                        onClick={() => handleFrequesiaChange('')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50"
                      >
                        Nenhuma
                      </button>
                      {freguesias.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => handleFrequesiaChange(f)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-viseu-gold/5 transition-colors
                                     ${selectedFreguesia === f ? 'bg-viseu-gold/10 text-viseu-dark font-medium' : 'text-gray-700'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="location-card animate-fade-in">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-14 h-14 bg-category-blue/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-category-blue" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-viseu-dark mb-1">
                  Onde é o problema?
                </h3>
                <p className="text-sm text-gray-500">
                  Toque no mapa ou use o GPS para marcar
                </p>
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={geolocation.getCurrentLocation}
                disabled={geolocation.loading}
                className="hidden sm:flex w-12 h-12 bg-gradient-blue rounded-xl shadow-blue
                           items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Usar GPS"
              >
                {geolocation.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Navigation className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Error messages */}
            {(geolocation.error || outOfBoundsError) && (
              <div className="mt-3 p-3 bg-category-red/10 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-category-red-dark flex-shrink-0" />
                <p className="text-sm text-category-red-dark">{geolocation.error || outOfBoundsError}</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
