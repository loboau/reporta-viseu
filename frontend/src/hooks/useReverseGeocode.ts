'use client'

import { useState, useCallback } from 'react'
import { Location, ReverseGeocodeResult } from '@/types'
import { NOMINATIM_URL } from '@/lib/constants'

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseGeocode = useCallback(
    async (location: Location): Promise<ReverseGeocodeResult | null> => {
      setLoading(true)
      setError(null)

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

        setLoading(false)

        return {
          address: address || 'Endereço não encontrado',
          freguesia,
        }
      } catch (err) {
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
