'use client'

import { useState, useCallback } from 'react'
import type { Location, GeolocationState } from '@/types'
import { isPointInViseuConcelho } from '@/lib/constants'

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  })

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        loading: false,
        error: 'Geolocalização não suportada',
      })
      return
    }

    setState({ location: null, loading: true, error: null })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Verificar se a localização está dentro do concelho de Viseu
        if (!isPointInViseuConcelho(lat, lng)) {
          setState({
            location: null,
            loading: false,
            error: 'A sua localização está fora do Concelho de Viseu. Por favor, selecione manualmente um local no mapa.',
          })
          return
        }

        const location: Location = { lat, lng }
        setState({ location, loading: false, error: null })
      },
      (error) => {
        let errorMessage = 'Não foi possível obter localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Não foi possível obter localização'
            break
          case error.TIMEOUT:
            errorMessage = 'Não foi possível obter localização'
            break
        }

        setState({ location: null, loading: false, error: errorMessage })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}
