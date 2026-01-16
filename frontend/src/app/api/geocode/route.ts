import { NextRequest, NextResponse } from 'next/server'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'ViseuReporta/2.0 (https://reporta.viseu.pt; municipal-reporting-app)'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 })
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

    // Build address from components
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

    return NextResponse.json({
      address: address || 'Endereço não encontrado',
      freguesia,
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
