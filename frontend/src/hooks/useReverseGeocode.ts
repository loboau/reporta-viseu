'use client'

import { useState, useCallback, useRef } from 'react'
import { Location, ReverseGeocodeResult } from '@/types'
import { NOMINATIM_URL } from '@/lib/constants'

// Simple in-memory cache for geocode results
const geocodeCache = new Map<string, { result: ReverseGeocodeResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(lat: number, lng: number): string {
  // Round to 5 decimal places (~1m precision) for cache key
  return `${lat.toFixed(5)},${lng.toFixed(5)}`
}

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const reverseGeocode = useCallback(
    async (location: Location): Promise<ReverseGeocodeResult | null> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const cacheKey = getCacheKey(location.lat, location.lng)

      // Check cache first
      const cached = geocodeCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result
      }

      setLoading(true)
      setError(null)

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const params = new URLSearchParams({
          lat: location.lat.toString(),
          lon: location.lng.toString(),
          format: 'json',
          addressdetails: '1',
          zoom: '18',
        })

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: {
            'Accept-Language': 'pt-PT,pt',
          },
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Erro ao obter endereço')
        }

        const data = await response.json()

        // Build a readable address from components
        const address = [
          data.address?.road,
          data.address?.house_number,
          data.address?.suburb || data.address?.neighbourhood,
          data.address?.city || data.address?.town || data.address?.village,
        ]
          .filter(Boolean)
          .join(', ')

        // Try to extract freguesia from various fields
        const freguesia =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.quarter ||
          null

        const result: ReverseGeocodeResult = {
          address: address || 'Endereço não encontrado',
          freguesia,
        }

        // Store in cache
        geocodeCache.set(cacheKey, { result, timestamp: Date.now() })

        setLoading(false)
        return result
      } catch (err) {
        // Don't set error state for aborted requests
        if (err instanceof Error && err.name === 'AbortError') {
          return null
        }
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao obter endereço'
        setError(errorMessage)
        setLoading(false)
        return null
      }
    },
    []
  )

  return {
    reverseGeocode,
    loading,
    error,
  }
}
