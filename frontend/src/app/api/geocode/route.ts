import { NextRequest, NextResponse } from 'next/server'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'ViseuReporta/2.0 (https://reporta.viseu.pt; municipal-reporting-app)'

// Simple cache
const cache = new Map<string, { address: string; freguesia: string | null; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(lat: string, lng: string): string {
  return `${parseFloat(lat).toFixed(5)},${parseFloat(lng).toFixed(5)}`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 })
  }

  const cacheKey = getCacheKey(lat, lng)

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ address: cached.address, freguesia: cached.freguesia })
  }

  try {
    const params = new URLSearchParams({
      lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      zoom: '18',
    })

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'pt-PT,pt',
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: response.status })
    }

    const data = await response.json()

    const address = [
      data.address?.road,
      data.address?.house_number,
      data.address?.suburb || data.address?.neighbourhood,
      data.address?.city || data.address?.town || data.address?.village,
    ]
      .filter(Boolean)
      .join(', ')

    const freguesia =
      data.address?.suburb ||
      data.address?.neighbourhood ||
      data.address?.quarter ||
      null

    const result = {
      address: address || 'Endereço não encontrado',
      freguesia,
      timestamp: Date.now(),
    }

    // Store in cache
    cache.set(cacheKey, result)

    // Clean old entries if cache gets too large
    if (cache.size > 500) {
      const firstKey = cache.keys().next().value
      if (firstKey) cache.delete(firstKey)
    }

    return NextResponse.json({ address: result.address, freguesia: result.freguesia })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
