import { useState, useEffect, useCallback, useRef } from 'react'
import { Location } from '@/types'
import { isPointInViseuConcelho, VISEU_BBOX } from '@/lib/constants'

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    road?: string
    suburb?: string
    city?: string
    city_district?: string
    town?: string
    municipality?: string
    county?: string
    state?: string
    postcode?: string
  }
}

interface AddressSearchResult {
  id: number
  displayName: string
  location: Location
  isInConcelho: boolean
}

// Prefixos de códigos postais do concelho de Viseu
const VISEU_POSTCODE_PREFIXES = ['3500', '3510', '3515', '3520']

// Verifica se o código postal é de Viseu
function isViseuPostcode(postcode?: string): boolean {
  if (!postcode) return false
  return VISEU_POSTCODE_PREFIXES.some(prefix => postcode.startsWith(prefix))
}

// Verifica se o endereço é do concelho de Viseu
function isViseuConcelhoAddress(address?: NominatimResult['address']): boolean {
  if (!address) return false
  const city = address.city || address.city_district || address.town || address.municipality || ''
  const isViseuCity = city.toLowerCase() === 'viseu'
  const hasViseuPostcode = isViseuPostcode(address.postcode)
  return isViseuCity || hasViseuPostcode
}

export function useAddressSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced search with abort controller
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setLoading(true)
    setError(null)

    const timeoutId = setTimeout(async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        // Pesquisa com viewbox para dar prioridade ao concelho de Viseu
        const searchQuery = encodeURIComponent(`${query}, Viseu`)
        const viewbox = `${VISEU_BBOX.west},${VISEU_BBOX.north},${VISEU_BBOX.east},${VISEU_BBOX.south}`
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=8&addressdetails=1&viewbox=${viewbox}&bounded=0&countrycodes=pt`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: abortControllerRef.current.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Erro ao pesquisar morada')
        }

        const data: NominatimResult[] = await response.json()

        // Filtrar e ordenar: primeiro os que estão dentro do concelho
        const mappedResults: AddressSearchResult[] = data.map((item) => {
          const lat = parseFloat(item.lat)
          const lng = parseFloat(item.lon)
          const isInConcelho = isPointInViseuConcelho(lat, lng) || isViseuConcelhoAddress(item.address)

          return {
            id: item.place_id,
            displayName: item.display_name,
            location: {
              lat,
              lng,
              address: item.display_name,
            },
            isInConcelho,
          }
        })

        // Ordenar: resultados dentro do concelho primeiro
        const sortedResults = mappedResults.sort((a, b) => {
          if (a.isInConcelho && !b.isInConcelho) return -1
          if (!a.isInConcelho && b.isInConcelho) return 1
          return 0
        })

        // Limitar a 5 resultados, priorizando os do concelho
        setResults(sortedResults.slice(0, 5))
        setLoading(false)
      } catch (err) {
        // Don't set error for aborted requests
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Erro ao pesquisar')
        setResults([])
        setLoading(false)
      }
    }, 400) // 400ms debounce

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query])

  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setQuery('')
    setResults([])
    setError(null)
    setLoading(false)
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  }
}
