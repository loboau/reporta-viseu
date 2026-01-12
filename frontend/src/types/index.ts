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
