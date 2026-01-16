import { NextRequest, NextResponse } from 'next/server'

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'ViseuReporta/2.0 (https://reporta.viseu.pt; municipal-reporting-app)'

// Viseu bounding box
const VISEU_BBOX = {
  north: 40.85,
  south: 40.45,
  east: -7.65,
  west: -8.15,
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  try {
    const searchQuery = encodeURIComponent(`${query}, Viseu`)
    const viewbox = `${VISEU_BBOX.west},${VISEU_BBOX.north},${VISEU_BBOX.east},${VISEU_BBOX.south}`

    const response = await fetch(
      `${NOMINATIM_SEARCH_URL}?q=${searchQuery}&format=json&limit=8&addressdetails=1&viewbox=${viewbox}&bounded=0&countrycodes=pt`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': USER_AGENT,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ results: data })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
