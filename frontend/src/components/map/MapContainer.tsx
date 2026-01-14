'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents, useMap, Polygon } from 'react-leaflet'
import { LatLngExpression, Icon, Map } from 'leaflet'
import { Phone, Mail, Globe, AlertTriangle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { Location } from '@/types'
import { MAP_CONFIG, VISEU_CONCELHO_BOUNDS, isPointInViseuConcelho } from '@/lib/constants'

// Câmara Municipal de Viseu location and info
// Coordinates from: https://mapcarta.com/W282549483
const CAMARA_VISEU = {
  lat: 40.65757,
  lng: -7.91431,
  name: 'Câmara Municipal de Viseu',
  address: 'Praça da República, 3514-501 Viseu',
  phone: '+351 232 427 422',
  email: 'geral@cmviseu.pt',
  website: 'https://www.cm-viseu.pt',
}


// V2 Pin colors - uses PNG icons from /v2/icons/
type PinColor = 'rosa' | 'verde' | 'amarelo'

const PIN_ICONS: Record<PinColor, string> = {
  rosa: '/v2/icons/Icon_Pin_Rosa.png',
  verde: '/v2/icons/Icon_Pin_Verde.png',
  amarelo: '/v2/icons/Icon_Pin_Amarelo.png',
}

// V2 marker icon using PNG pins (for future use with different pin colors)
const createV2MarkerIcon = (color: PinColor = 'rosa') => {
  if (typeof window === 'undefined') return undefined

  return new Icon({
    iconUrl: PIN_ICONS[color],
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  })
}

interface MapContainerProps {
  location: Location | null
  onLocationChange: (location: Location) => void
  className?: string
  zoomInTrigger?: number
  zoomOutTrigger?: number
  onMapReady?: (mapApi: { zoomIn: () => void; zoomOut: () => void }) => void
}

// Component to handle map clicks with boundary validation
function MapClickHandler({
  onLocationChange,
  onOutOfBounds,
}: {
  onLocationChange: (location: Location) => void
  onOutOfBounds: () => void
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng

      // Verificar se o ponto está dentro do concelho de Viseu
      if (isPointInViseuConcelho(lat, lng)) {
        onLocationChange({
          lat,
          lng,
        })
      } else {
        onOutOfBounds()
      }
    },
  })
  return null
}

// Component to handle map centering
function MapCenterController({ center }: { center: LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      duration: 0.5,
    })
  }, [center, map])

  return null
}

// Component to expose map instance and handle zoom
function MapController({
  onMapInstanceReady,
  onMapApiReady,
  zoomInTrigger,
  zoomOutTrigger,
}: {
  onMapInstanceReady: (map: Map) => void
  onMapApiReady?: (mapApi: { zoomIn: () => void; zoomOut: () => void }) => void
  zoomInTrigger: number
  zoomOutTrigger: number
}) {
  const map = useMap()
  const prevZoomInRef = useRef(zoomInTrigger)
  const prevZoomOutRef = useRef(zoomOutTrigger)
  const apiExposedRef = useRef(false)

  useEffect(() => {
    onMapInstanceReady(map)

    // Expose zoom API to parent - only once
    if (onMapApiReady && !apiExposedRef.current) {
      apiExposedRef.current = true
      onMapApiReady({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
      })
    }
  }, [map, onMapInstanceReady, onMapApiReady])

  // Handle zoom in - compare with previous value (fallback for trigger-based zoom)
  useEffect(() => {
    if (zoomInTrigger > 0 && zoomInTrigger !== prevZoomInRef.current) {
      map.zoomIn()
    }
    prevZoomInRef.current = zoomInTrigger
  }, [zoomInTrigger, map])

  // Handle zoom out - compare with previous value (fallback for trigger-based zoom)
  useEffect(() => {
    if (zoomOutTrigger > 0 && zoomOutTrigger !== prevZoomOutRef.current) {
      map.zoomOut()
    }
    prevZoomOutRef.current = zoomOutTrigger
  }, [zoomOutTrigger, map])

  return null
}

// User's selected location marker - uses yellow "R" pin from logos
// Original image is 421x479px (ratio ~0.88), has pointed bottom like a pin
const createUserLocationIcon = () => {
  if (typeof window === 'undefined') return undefined

  // Keep aspect ratio: 421/479 ≈ 0.88, so for height 54, width ≈ 47
  return new Icon({
    iconUrl: '/v2/logos/Viseu_Reporta_Símbolo_R.png',
    iconSize: [47, 54],
    iconAnchor: [23, 54], // Center-bottom anchor (pin points down)
    popupAnchor: [0, -54],
  })
}

// Câmara Municipal marker icon - uses the main symbol without letter
const createCamaraMarkerIcon = () => {
  if (typeof window === 'undefined') return undefined

  return new Icon({
    iconUrl: '/v2/logos/Viseu_Reporta_Símbolo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

function MapContainerComponent({
  location,
  onLocationChange,
  className = '',
  zoomInTrigger = 0,
  zoomOutTrigger = 0,
  onMapReady,
}: MapContainerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<Icon | undefined>(undefined)
  const [camaraIcon, setCamaraIcon] = useState<Icon | undefined>(undefined)
  const [mapInstance, setMapInstance] = useState<Map | null>(null)
  const [showOutOfBoundsWarning, setShowOutOfBoundsWarning] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setMarkerIcon(createUserLocationIcon())
    setCamaraIcon(createCamaraMarkerIcon())
  }, [])

  // Handler para quando o utilizador clica fora do concelho
  const handleOutOfBounds = useCallback(() => {
    setShowOutOfBoundsWarning(true)
    // Esconder o aviso após 3 segundos
    setTimeout(() => setShowOutOfBoundsWarning(false), 3000)
  }, [])

  if (!isMounted) {
    return (
      <div className={`${className} bg-app-bg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="spinner mx-auto mb-3" />
          <p className="text-sm font-medium">A carregar mapa...</p>
        </div>
      </div>
    )
  }

  const center: LatLngExpression = location
    ? [location.lat, location.lng]
    : MAP_CONFIG.center

  return (
    <div className={`${className} relative`}>
      <LeafletMap
        center={center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="z-0"
        zoomControl={false}
      >
        {/* Clean pastel map style - CartoDB Voyager (light and clean) */}
        <TileLayer
          attribution={MAP_CONFIG.attribution}
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController
          onMapInstanceReady={setMapInstance}
          onMapApiReady={onMapReady}
          zoomInTrigger={zoomInTrigger}
          zoomOutTrigger={zoomOutTrigger}
        />
        <MapClickHandler
          onLocationChange={onLocationChange}
          onOutOfBounds={handleOutOfBounds}
        />

        {/* Limites do Concelho de Viseu - V2 pink */}
        <Polygon
          positions={VISEU_CONCELHO_BOUNDS}
          pathOptions={{
            color: '#E91E63',
            weight: 2,
            opacity: 0.7,
            fillColor: '#E91E63',
            fillOpacity: 0.03,
            dashArray: '5, 10',
          }}
        />

        {/* Câmara Municipal de Viseu - Fixed marker */}
        {camaraIcon && (
          <Marker
            position={[CAMARA_VISEU.lat, CAMARA_VISEU.lng]}
            icon={camaraIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-viseu-dark text-base mb-2">
                  {CAMARA_VISEU.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {CAMARA_VISEU.address}
                </p>
                <div className="space-y-1 text-sm">
                  <a
                    href={`tel:${CAMARA_VISEU.phone}`}
                    className="flex items-center gap-2 text-category-blue hover:underline"
                  >
                    <Phone className="w-4 h-4" /> {CAMARA_VISEU.phone}
                  </a>
                  <a
                    href={`mailto:${CAMARA_VISEU.email}`}
                    className="flex items-center gap-2 text-category-blue hover:underline"
                  >
                    <Mail className="w-4 h-4" /> {CAMARA_VISEU.email}
                  </a>
                  <a
                    href={CAMARA_VISEU.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-category-blue hover:underline"
                  >
                    <Globe className="w-4 h-4" /> Website
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User's selected location marker */}
        {location && markerIcon && (
          <>
            <MapCenterController center={[location.lat, location.lng]} />
            <Marker
              position={[location.lat, location.lng]}
              icon={markerIcon}
            />
          </>
        )}
      </LeafletMap>

      {/* Aviso de localização fora do concelho */}
      {showOutOfBoundsWarning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
          <div className="bg-red-500 text-white px-5 py-3 rounded-2xl shadow-float
                          text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Localização fora do Concelho de Viseu</span>
          </div>
        </div>
      )}

      {/* Legenda do limite do concelho */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm
                        text-xs text-gray-600 flex items-center gap-2">
          <span className="w-4 h-0.5 bg-v2-pink" style={{ borderStyle: 'dashed' }} />
          Limite do Concelho
        </div>
      </div>
    </div>
  )
}

export default MapContainerComponent
