'use client'

import { useState, useCallback, useRef } from 'react'
import type { Location, ReverseGeocodeResult } from '@/types'

// Simple in-memory cache for geocode results
const geocodeCache = new Map<string, { result: ReverseGeocodeResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(lat: number, lng: number): string {
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
        const response = await fetch(
          `/api/geocode?lat=${location.lat}&lng=${location.lng}`,
          {
            signal: abortControllerRef.current.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Erro ao obter endereço')
        }

        const result: ReverseGeocodeResult = await response.json()

        // Store in cache
        geocodeCache.set(cacheKey, { result, timestamp: Date.now() })

        setLoading(false)
        return result
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return null
        }
        const errorMessage = err instanceof Error ? err.message : 'Erro ao obter endereço'
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
