'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, X, Target, Eye, AlertTriangle } from 'lucide-react'
import { Location } from '@/types'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocode } from '@/hooks/useReverseGeocode'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { isPointInViseuConcelho } from '@/lib/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">A carregar mapa...</p>
        </div>
      </div>
    ),
  }
)

interface Step1LocationV2Props {
  location: Location | null
  onLocationChange: (location: Location) => void
}

export default function Step1LocationV2({
  location,
  onLocationChange,
}: Step1LocationV2Props) {
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Zoom triggers
  const [zoomInTrigger, setZoomInTrigger] = useState(0)
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0)

  // Map API ref
  const mapApiRef = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null)

  const handleMapReady = (api: { zoomIn: () => void; zoomOut: () => void }) => {
    mapApiRef.current = api
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation.location])

  // Show/hide dropdown
  useEffect(() => {
    if (addressSearch.results.length > 0 && addressSearch.query) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [addressSearch.results, addressSearch.query])

  // Close dropdown on outside click
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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationChange = useCallback(async (newLocation: Location) => {
    onLocationChange(newLocation)

    const result = await reverseGeocode(newLocation)
    if (result) {
      onLocationChange({
        ...newLocation,
        address: result.address,
        freguesia: result.freguesia || undefined,
      })
    }
  }, [onLocationChange, reverseGeocode])

  const [outOfBoundsError, setOutOfBoundsError] = useState<string | null>(null)

  const handleAddressSelect = async (result: typeof addressSearch.results[0]) => {
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
      {/* Fullscreen Map */}
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

      {/* Search Bar - V2 Style */}
      <div className="absolute top-20 sm:top-24 left-3 right-3 sm:left-4 sm:right-4 z-20 max-w-xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={addressSearch.query}
              onChange={(e) => addressSearch.setQuery(e.target.value)}
              placeholder="Pesquisar morada"
              className="w-full px-10 sm:px-12 py-3 sm:py-3.5 bg-transparent border-0 rounded-xl sm:rounded-2xl
                         focus:ring-0 outline-none
                         placeholder:text-gray-400 text-gray-900 text-sm sm:text-base"
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

          {/* Search Results */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="border-t border-gray-100 max-h-64 overflow-y-auto"
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
                        className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3
                                   ${result.isInConcelho ? 'hover:bg-gray-50' : 'hover:bg-red-50 opacity-60'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${result.isInConcelho
                                          ? 'bg-v2-blue/10'
                                          : 'bg-red-100'}`}>
                          {result.isInConcelho ? (
                            <MapPin className="w-4 h-4 text-v2-blue" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <span className={`text-sm leading-tight block
                                           ${result.isInConcelho ? 'text-gray-700' : 'text-gray-500'}`}>
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

      {/* Map Controls - V2 Style */}
      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 sm:gap-3">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <button
            type="button"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
            onClick={handleZoomIn}
            aria-label="Aumentar zoom"
          >
            <span className="text-lg sm:text-xl font-medium text-gray-600">+</span>
          </button>
          <button
            type="button"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
            onClick={handleZoomOut}
            aria-label="Diminuir zoom"
          >
            <span className="text-lg sm:text-xl font-medium text-gray-600">−</span>
          </button>
        </div>

        {/* GPS Button - Below zoom controls */}
        <button
          type="button"
          onClick={geolocation.getCurrentLocation}
          disabled={geolocation.loading}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center
                     transition-all hover:scale-105 active:scale-95"
          aria-label="Usar minha localização"
        >
          {geolocation.loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Location Info Card - V2 Style */}
      <div className="absolute bottom-32 sm:bottom-36 left-3 right-3 sm:left-4 sm:right-4 z-20 max-w-xl mx-auto">
        {location ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 animate-slide-up">
            <div className="flex items-start gap-2.5 sm:gap-3">
              {/* R Logo Icon - Yellow symbol matching the map marker */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                <img
                  src="/v2/logos/Viseu_Reporta_Símbolo_R.png"
                  alt="Localização"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">
                  Localização marcada
                </h3>

                {geocodeLoading ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    A obter morada...
                  </div>
                ) : (
                  <>
                    {location.address && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {location.address}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 animate-fade-in">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5">
                  Onde é o problema?
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Toque no mapa ou use o GPS
                </p>
              </div>
            </div>

            {(geolocation.error || outOfBoundsError) && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 rounded-lg sm:rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-600">{geolocation.error || outOfBoundsError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
