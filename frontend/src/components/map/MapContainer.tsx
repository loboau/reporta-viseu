'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents, useMap, Polygon } from 'react-leaflet'
import { LatLngExpression, Icon, DivIcon, Map } from 'leaflet'
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


// Custom Viseu gold marker icon - City Guide style pin
const createViseuMarkerIcon = () => {
  if (typeof window === 'undefined') return undefined

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow)">
            <path d="M24 52C24 52 42 34.5 42 22C42 12.0589 33.9411 4 24 4C14.0589 4 6 12.0589 6 22C6 34.5 24 52 24 52Z" fill="#E8B923"/>
            <path d="M24 52C24 52 42 34.5 42 22C42 12.0589 33.9411 4 24 4C14.0589 4 6 12.0589 6 22C6 34.5 24 52 24 52Z" fill="url(#gradient)"/>
            <circle cx="24" cy="22" r="10" fill="white"/>
            <circle cx="24" cy="22" r="6" fill="#E8B923"/>
          </g>
          <defs>
            <linearGradient id="gradient" x1="24" y1="4" x2="24" y2="52" gradientUnits="userSpaceOnUse">
              <stop stop-color="#F2D054"/>
              <stop offset="1" stop-color="#E8B923"/>
            </linearGradient>
            <filter id="shadow" x="0" y="0" width="48" height="60" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
            </filter>
          </defs>
        </svg>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
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

// Câmara Municipal marker icon
const createCamaraMarkerIcon = () => {
  if (typeof window === 'undefined') return undefined

  return new DivIcon({
    className: 'camara-marker',
    html: `
      <div class="relative cursor-pointer">
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 46C20 46 36 30 36 18C36 9.16344 28.8366 2 20 2C11.1634 2 4 9.16344 4 18C4 30 20 46 20 46Z" fill="#3B82F6"/>
          <circle cx="20" cy="18" r="8" fill="white"/>
          <path d="M16 15h8v6h-8z M18 13h4v2h-4z M15 21h10v1h-10z" fill="#3B82F6"/>
        </svg>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
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
  const [markerIcon, setMarkerIcon] = useState<DivIcon | undefined>(undefined)
  const [camaraIcon, setCamaraIcon] = useState<DivIcon | undefined>(undefined)
  const [mapInstance, setMapInstance] = useState<Map | null>(null)
  const [showOutOfBoundsWarning, setShowOutOfBoundsWarning] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setMarkerIcon(createViseuMarkerIcon())
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

        {/* Limites do Concelho de Viseu */}
        <Polygon
          positions={VISEU_CONCELHO_BOUNDS}
          pathOptions={{
            color: '#E8B923',
            weight: 2,
            opacity: 0.8,
            fillColor: '#E8B923',
            fillOpacity: 0.05,
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

      {/* Instruction overlay - only when no location */}
      {!location && !showOutOfBoundsWarning && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-float
                          text-sm text-viseu-gray font-medium flex items-center gap-2
                          animate-fade-in">
            <span className="w-2.5 h-2.5 bg-viseu-gold rounded-full animate-pulse" />
            Toque no mapa para marcar
          </div>
        </div>
      )}

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
                        text-xs text-viseu-gray flex items-center gap-2">
          <span className="w-4 h-0.5 bg-viseu-gold" style={{ borderStyle: 'dashed' }} />
          Limite do Concelho
        </div>
      </div>
    </div>
  )
}

export default MapContainerComponent
