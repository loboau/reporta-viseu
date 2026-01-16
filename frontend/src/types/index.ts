export interface Location {
  lat: number
  lng: number
  address?: string
  freguesia?: string
}

export interface Category {
  id: string
  icon: string
  label: string
  sublabel: string
  departamento: string
  email: string
  color: string
  colorDark: string
  colorClass: string // Tailwind class name for the gradient background
  shadowClass: string // Tailwind class name for the colored shadow
}

export interface Photo {
  id: string
  file: File
  preview: string
}

export type Urgency = 'baixa' | 'media' | 'alta'

// V2 Types
export type UrgencyV2 = 'pouco_urgente' | 'urgente' | 'perigoso'

export interface CategoryV2 {
  id: string
  label: string
  sublabel: string
  departamento: string
  email: string
  color: string
  iconPath: string
  placeholder?: string
}

export interface ReportDataV2 {
  location: Location | null
  category: CategoryV2 | null
  description: string
  photos: Photo[]
  urgency: UrgencyV2
  isAnonymous: boolean
  name: string
  email: string
  phone: string
  reference?: string
  letter?: string
}

export interface WizardStateV2 {
  currentStep: number
  data: ReportDataV2
  isSubmitting: boolean
  isSubmitted: boolean
  submitError: string | null
}

export type WizardActionV2 =
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_CATEGORY'; payload: CategoryV2 }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'REMOVE_PHOTO'; payload: string }
  | { type: 'SET_URGENCY'; payload: UrgencyV2 }
  | { type: 'SET_ANONYMOUS'; payload: boolean }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: { reference: string; letter: string } }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'REGENERATE_START' }
  | { type: 'REGENERATE_SUCCESS'; payload: string }
  | { type: 'RESET' }

export interface ReportData {
  location: Location | null
  category: Category | null
  description: string
  photos: Photo[]
  urgency: Urgency
  isAnonymous: boolean
  name: string
  email: string
  phone: string
  reference?: string
  letter?: string
}

export interface WizardState {
  currentStep: number
  data: ReportData
  isSubmitting: boolean
  isSubmitted: boolean
  submitError: string | null
}

export type WizardAction =
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'REMOVE_PHOTO'; payload: string }
  | { type: 'SET_URGENCY'; payload: Urgency }
  | { type: 'SET_ANONYMOUS'; payload: boolean }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: { reference: string; letter: string } }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'REGENERATE_START' }
  | { type: 'REGENERATE_SUCCESS'; payload: string }
  | { type: 'RESET' }

export interface GeolocationState {
  location: Location | null
  loading: boolean
  error: string | null
}

export interface ReverseGeocodeResult {
  address: string
  freguesia: string | null
}

/**
 * V2 Urgency option configuration for UI display
 */
export interface UrgencyOptionV2 {
  readonly id: UrgencyV2
  readonly label: string
  readonly color: string
  readonly bgColor: string
  readonly iconPath: string
}

/**
 * Address search result from Nominatim
 */
export interface AddressSearchResult {
  id: number
  displayName: string
  location: Location
  isInConcelho: boolean
}

/**
 * Map API interface exposed by MapContainer
 */
export interface MapApi {
  zoomIn: () => void
  zoomOut: () => void
}
