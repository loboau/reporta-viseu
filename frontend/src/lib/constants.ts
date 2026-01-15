import { LatLngExpression, LatLngTuple } from 'leaflet'

// Praça da República, 3514-501 Viseu (centro histórico)
export const VISEU_CENTER: LatLngExpression = [40.6610, -7.9097]

export const MAP_CONFIG = {
  center: VISEU_CENTER,
  zoom: 13,
  minZoom: 10,
  maxZoom: 18,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

// Polígono exterior grande para criar máscara (cobre área fora do concelho)
export const WORLD_BOUNDS: LatLngTuple[] = [
  [85, -180],
  [85, 180],
  [-85, 180],
  [-85, -180],
  [85, -180],
]

// Limites aproximados do Concelho de Viseu (polígono simplificado)
// O concelho tem 34 freguesias e cerca de 507 km²
export const VISEU_CONCELHO_BOUNDS: LatLngTuple[] = [
  [40.7650, -7.8200], // Norte - Rio de Loba
  [40.7580, -7.7800], // Nordeste - Côta
  [40.7400, -7.7500], // Este - Mundão
  [40.7100, -7.7400], // Este - Cavernães
  [40.6800, -7.7450], // Este - Ranhados
  [40.6500, -7.7600], // Sudeste - Povolide
  [40.6200, -7.7800], // Sul - São João de Lourosa
  [40.5900, -7.8100], // Sul - Silgueiros
  [40.5700, -7.8500], // Sul - Fragosela
  [40.5600, -7.9000], // Sudoeste - Bodiosa
  [40.5650, -7.9500], // Sudoeste - Santos Evos
  [40.5800, -7.9900], // Oeste - Calde
  [40.6000, -8.0200], // Oeste - Campo
  [40.6300, -8.0400], // Noroeste - Lordosa
  [40.6600, -8.0500], // Noroeste - Vil de Souto
  [40.6900, -8.0400], // Noroeste - São Pedro de France
  [40.7200, -8.0100], // Norte - Abraveses
  [40.7400, -7.9700], // Norte - Orgens
  [40.7550, -7.9200], // Norte - Farminhão
  [40.7650, -7.8700], // Norte - Rio de Loba
  [40.7650, -7.8200], // Volta ao início
]

// Bounding box simplificado para verificação rápida
export const VISEU_BBOX = {
  north: 40.7650,
  south: 40.5600,
  east: -7.7400,
  west: -8.0500,
}

// Função para verificar se um ponto está dentro do polígono do concelho
export function isPointInViseuConcelho(lat: number, lng: number): boolean {
  // Verificação rápida com bounding box primeiro
  if (lat > VISEU_BBOX.north || lat < VISEU_BBOX.south ||
      lng > VISEU_BBOX.east || lng < VISEU_BBOX.west) {
    return false
  }

  // Algoritmo ray-casting para verificar se ponto está dentro do polígono
  let inside = false
  const polygon = VISEU_CONCELHO_BOUNDS

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

export const MAX_PHOTOS = 5
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const URGENCY_LABELS = {
  baixa: 'Pode esperar',
  media: 'Urgente',
  alta: 'Perigoso',
} as const

export const URGENCY_COLORS = {
  baixa: 'bg-green-500',
  media: 'bg-yellow-500',
  alta: 'bg-red-500',
} as const
