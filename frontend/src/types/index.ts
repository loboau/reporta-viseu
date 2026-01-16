/**
 * @fileoverview Core type definitions for the Viseu Reporta V2 application.
 * This module exports all shared types, interfaces, and type guards used across the application.
 *
 * @module types
 * @version 2.0.0
 */

// =============================================================================
// BRANDED TYPES
// =============================================================================

/**
 * Creates a branded/nominal type for compile-time type safety.
 * Branded types prevent accidental mixing of structurally identical types.
 *
 * @template T - The base type to brand
 * @template B - The brand identifier (string literal)
 *
 * @example
 * ```typescript
 * type UserId = Brand<string, 'UserId'>;
 * type OrderId = Brand<string, 'OrderId'>;
 *
 * const userId: UserId = 'user-123' as UserId;
 * const orderId: OrderId = userId; // Type error! Cannot assign UserId to OrderId
 * ```
 */
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

/**
 * Unique identifier for a photo in the upload queue.
 * Branded to prevent confusion with other string IDs.
 */
export type PhotoId = Brand<string, 'PhotoId'>;

/**
 * Unique reference number for a submitted report.
 * Format: VR-YYYYMMDD-XXXX (e.g., VR-20240115-A3B7)
 */
export type ReportReference = Brand<string, 'ReportReference'>;

// =============================================================================
// LOCATION TYPES
// =============================================================================

/**
 * Geographic coordinates with optional address information.
 * Used for pinpointing problem locations within the Viseu municipality.
 *
 * @example
 * ```typescript
 * const location: Location = {
 *   lat: 40.6610,
 *   lng: -7.9097,
 *   address: 'Praça da República, Viseu',
 *   freguesia: 'Viseu'
 * };
 * ```
 */
export interface Location {
  /** Latitude coordinate (WGS84) */
  lat: number;
  /** Longitude coordinate (WGS84) */
  lng: number;
  /** Human-readable address from reverse geocoding */
  address?: string;
  /** Parish (freguesia) within Viseu municipality */
  freguesia?: string;
}

/**
 * Bounding box for geographic area filtering.
 * Used to define the Viseu municipality boundaries.
 */
export interface BoundingBox {
  /** Northern latitude boundary */
  readonly north: number;
  /** Southern latitude boundary */
  readonly south: number;
  /** Eastern longitude boundary */
  readonly east: number;
  /** Western longitude boundary */
  readonly west: number;
}

/**
 * Result of reverse geocoding operation.
 */
export interface ReverseGeocodeResult {
  /** Formatted address string */
  readonly address: string;
  /** Parish name if identifiable */
  readonly freguesia: string | null;
}

/**
 * State for geolocation hook.
 */
export interface GeolocationState {
  /** Current location or null if not yet obtained */
  readonly location: Location | null;
  /** Whether a geolocation request is in progress */
  readonly loading: boolean;
  /** Error message if geolocation failed */
  readonly error: string | null;
}

/**
 * Result from address search (Nominatim API).
 */
export interface AddressSearchResult {
  /** Unique place identifier from Nominatim */
  readonly id: number;
  /** Full display name of the address */
  readonly displayName: string;
  /** Geographic coordinates of the address */
  readonly location: Location;
  /** Whether the address is within Viseu municipality */
  readonly isInConcelho: boolean;
}

// =============================================================================
// CATEGORY TYPES
// =============================================================================

/**
 * Legacy category definition (V1).
 * @deprecated Use CategoryV2 for new implementations.
 */
export interface Category {
  /** Unique category identifier */
  readonly id: string;
  /** Icon class or name */
  readonly icon: string;
  /** Display label */
  readonly label: string;
  /** Descriptive subtitle */
  readonly sublabel: string;
  /** Responsible municipal department */
  readonly departamento: string;
  /** Department contact email */
  readonly email: string;
  /** Primary color (hex) */
  readonly color: string;
  /** Dark variant of color (hex) */
  readonly colorDark: string;
  /** Tailwind gradient class */
  readonly colorClass: string;
  /** Tailwind shadow class */
  readonly shadowClass: string;
}

/**
 * Problem category definition (V2).
 * Represents a type of municipal issue that can be reported.
 *
 * @example
 * ```typescript
 * const pavimentoCategory: CategoryV2 = {
 *   id: 'pavimento',
 *   label: 'Pavimento',
 *   sublabel: 'Buracos, passeios, asfalto',
 *   departamento: 'Divisao de Obras Publicas',
 *   email: 'obras.publicas@cm-viseu.pt',
 *   color: '#9c3895',
 *   iconPath: '/v2/icons/Icon_Pavimento.png',
 *   placeholder: 'Ex: Ha um buraco grande na estrada...'
 * };
 * ```
 */
export interface CategoryV2 {
  /** Unique category identifier (lowercase, no spaces) */
  id: string;
  /** Display label (Portuguese) */
  label: string;
  /** Descriptive subtitle with examples */
  sublabel: string;
  /** Responsible municipal department name */
  departamento: string;
  /** Department contact email */
  email: string;
  /** Primary brand color (hex format) */
  color: string;
  /** Path to category icon PNG */
  iconPath: string;
  /** Example description placeholder text */
  placeholder?: string;
}

/**
 * Valid category identifiers for V2.
 */
export type CategoryIdV2 =
  | 'pavimento'
  | 'iluminacao'
  | 'limpeza'
  | 'jardins'
  | 'saneamento'
  | 'animais'
  | 'sinalizacao'
  | 'estacionamento'
  | 'edificios'
  | 'acessibilidade'
  | 'ruido'
  | 'outro';

// =============================================================================
// URGENCY TYPES
// =============================================================================

/**
 * Legacy urgency levels (V1).
 * @deprecated Use UrgencyV2 for new implementations.
 */
export type Urgency = 'baixa' | 'media' | 'alta';

/**
 * Urgency levels for V2 reports.
 * Determines prioritization of the reported issue.
 */
export type UrgencyV2 = 'pouco_urgente' | 'urgente' | 'perigoso';

/**
 * Configuration for urgency UI display.
 */
export interface UrgencyOptionV2 {
  /** Urgency level identifier */
  readonly id: UrgencyV2;
  /** Display label (Portuguese) */
  readonly label: string;
  /** Text/icon color (hex) */
  readonly color: string;
  /** Background color (hex) */
  readonly bgColor: string;
  /** Path to urgency icon */
  readonly iconPath: string;
}

/**
 * Maps V2 urgency to V1 format for API compatibility.
 */
export const URGENCY_V2_TO_V1: Readonly<Record<UrgencyV2, Urgency>> = {
  pouco_urgente: 'baixa',
  urgente: 'media',
  perigoso: 'alta',
} as const;

// =============================================================================
// PHOTO TYPES
// =============================================================================

/**
 * Photo attachment for a report.
 * Contains both the file object and a preview URL.
 */
export interface Photo {
  /** Unique identifier for the photo */
  id: string;
  /** Original file object from input */
  file: File;
  /** Object URL for preview display */
  preview: string;
}

/**
 * Configuration constants for photo uploads.
 */
export const PHOTO_CONFIG = {
  /** Maximum number of photos per report */
  MAX_COUNT: 5,
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,
  /** Accepted MIME types */
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
} as const;

// =============================================================================
// REPORT DATA TYPES
// =============================================================================

/**
 * Legacy report data structure (V1).
 * @deprecated Use ReportDataV2 for new implementations.
 */
export interface ReportData {
  location: Location | null;
  category: Category | null;
  description: string;
  photos: Photo[];
  urgency: Urgency;
  isAnonymous: boolean;
  name: string;
  email: string;
  phone: string;
  reference?: string;
  letter?: string;
}

/**
 * Complete report data for V2.
 * Contains all information needed to generate a formal complaint letter.
 */
export interface ReportDataV2 {
  /** Geographic location of the issue */
  location: Location | null;
  /** Problem category classification */
  category: CategoryV2 | null;
  /** User's description of the problem */
  description: string;
  /** Attached photos (max 5) */
  photos: Photo[];
  /** Urgency/priority level */
  urgency: UrgencyV2;
  /** Whether to submit anonymously */
  isAnonymous: boolean;
  /** Reporter's full name */
  name: string;
  /** Reporter's email address */
  email: string;
  /** Reporter's phone number (optional) */
  phone: string;
  /** Generated reference number (after submission) */
  reference?: ReportReference | string;
  /** Generated formal letter content (after submission) */
  letter?: string;
}

// =============================================================================
// WIZARD STATE TYPES
// =============================================================================

/**
 * Wizard step numbers.
 */
export type WizardStep = 1 | 2 | 3;

/**
 * Legacy wizard state (V1).
 * @deprecated Use WizardStateV2 for new implementations.
 */
export interface WizardState {
  readonly currentStep: number;
  readonly data: ReportData;
  readonly isSubmitting: boolean;
  readonly isSubmitted: boolean;
  readonly submitError: string | null;
}

/**
 * Complete wizard state for V2.
 * Tracks the current step, form data, and submission status.
 */
export interface WizardStateV2 {
  /** Current wizard step (1-3) */
  currentStep: WizardStep | number;
  /** Accumulated report data */
  data: ReportDataV2;
  /** Whether a submission/regeneration is in progress */
  isSubmitting: boolean;
  /** Whether the report has been successfully submitted */
  isSubmitted: boolean;
  /** Error message from failed submission */
  submitError: string | null;
}

// =============================================================================
// WIZARD ACTION TYPES (DISCRIMINATED UNION)
// =============================================================================

/**
 * Legacy wizard actions (V1).
 * @deprecated Use WizardActionV2 for new implementations.
 */
export type WizardAction =
  | { readonly type: 'SET_LOCATION'; readonly payload: Location }
  | { readonly type: 'SET_CATEGORY'; readonly payload: Category }
  | { readonly type: 'SET_DESCRIPTION'; readonly payload: string }
  | { readonly type: 'ADD_PHOTO'; readonly payload: Photo }
  | { readonly type: 'REMOVE_PHOTO'; readonly payload: string }
  | { readonly type: 'SET_URGENCY'; readonly payload: Urgency }
  | { readonly type: 'SET_ANONYMOUS'; readonly payload: boolean }
  | { readonly type: 'SET_NAME'; readonly payload: string }
  | { readonly type: 'SET_EMAIL'; readonly payload: string }
  | { readonly type: 'SET_PHONE'; readonly payload: string }
  | { readonly type: 'NEXT_STEP' }
  | { readonly type: 'PREV_STEP' }
  | { readonly type: 'SET_STEP'; readonly payload: number }
  | { readonly type: 'SUBMIT_START' }
  | { readonly type: 'SUBMIT_SUCCESS'; readonly payload: { reference: string; letter: string } }
  | { readonly type: 'SUBMIT_ERROR'; readonly payload: string }
  | { readonly type: 'REGENERATE_START' }
  | { readonly type: 'REGENERATE_SUCCESS'; readonly payload: string }
  | { readonly type: 'RESET' };

/**
 * Wizard reducer actions for V2.
 * Discriminated union enabling exhaustive type checking in reducers.
 *
 * @example
 * ```typescript
 * function wizardReducer(state: WizardStateV2, action: WizardActionV2): WizardStateV2 {
 *   switch (action.type) {
 *     case 'SET_LOCATION':
 *       return { ...state, data: { ...state.data, location: action.payload } };
 *     // ... handle all cases
 *     default:
 *       return assertNever(action); // Compile-time exhaustiveness check
 *   }
 * }
 * ```
 */
export type WizardActionV2 =
  | { readonly type: 'SET_LOCATION'; readonly payload: Location }
  | { readonly type: 'SET_CATEGORY'; readonly payload: CategoryV2 }
  | { readonly type: 'SET_DESCRIPTION'; readonly payload: string }
  | { readonly type: 'ADD_PHOTO'; readonly payload: Photo }
  | { readonly type: 'REMOVE_PHOTO'; readonly payload: string }
  | { readonly type: 'SET_URGENCY'; readonly payload: UrgencyV2 }
  | { readonly type: 'SET_ANONYMOUS'; readonly payload: boolean }
  | { readonly type: 'SET_NAME'; readonly payload: string }
  | { readonly type: 'SET_EMAIL'; readonly payload: string }
  | { readonly type: 'SET_PHONE'; readonly payload: string }
  | { readonly type: 'NEXT_STEP' }
  | { readonly type: 'PREV_STEP' }
  | { readonly type: 'SET_STEP'; readonly payload: number }
  | { readonly type: 'SUBMIT_START' }
  | { readonly type: 'SUBMIT_SUCCESS'; readonly payload: { reference: string; letter: string } }
  | { readonly type: 'SUBMIT_ERROR'; readonly payload: string }
  | { readonly type: 'REGENERATE_START' }
  | { readonly type: 'REGENERATE_SUCCESS'; readonly payload: string }
  | { readonly type: 'RESET' };

/**
 * Extracts the action type string from WizardActionV2.
 */
export type WizardActionType = WizardActionV2['type'];

// =============================================================================
// MAP TYPES
// =============================================================================

/**
 * API interface exposed by MapContainer for external control.
 */
export interface MapApi {
  /** Increase map zoom level by 1 */
  zoomIn: () => void;
  /** Decrease map zoom level by 1 */
  zoomOut: () => void;
}

/**
 * Props for MapContainer component.
 */
export interface MapContainerProps {
  /** Current selected location or null */
  readonly location: Location | null;
  /** Callback when user selects a new location */
  readonly onLocationChange: (location: Location) => void;
  /** Optional CSS class name */
  readonly className?: string;
  /** Trigger for zoom in action (increment to trigger) */
  readonly zoomInTrigger?: number;
  /** Trigger for zoom out action (increment to trigger) */
  readonly zoomOutTrigger?: number;
  /** Callback when map is ready, provides API for external control */
  readonly onMapReady?: (mapApi: MapApi) => void;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Request body for the generate-letter API endpoint.
 */
export interface GenerateLetterRequest {
  readonly location: Location | null;
  readonly category: {
    readonly id: string;
    readonly label: string;
    readonly departamento: string;
    readonly email: string;
  } | null;
  readonly description: string;
  readonly urgency: Urgency;
  readonly isAnonymous: boolean;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
}

/**
 * Successful response from generate-letter API.
 */
export interface GenerateLetterResponse {
  readonly success: true;
  readonly letter: string;
  readonly generatedAt: string;
}

/**
 * Error response from generate-letter API.
 */
export interface GenerateLetterError {
  readonly success?: false;
  readonly error: string;
}

/**
 * Union type for generate-letter API response.
 */
export type GenerateLetterResult = GenerateLetterResponse | GenerateLetterError;

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Common props for form input components.
 */
export interface FormInputProps {
  /** Input label text */
  readonly label?: string;
  /** Error message to display */
  readonly error?: string;
  /** Helper text below input */
  readonly helperText?: string;
  /** Whether the field is required */
  readonly required?: boolean;
}

/**
 * Props for the Button component.
 */
export interface ButtonProps {
  /** Button variant style */
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  readonly size?: 'sm' | 'md' | 'lg';
  /** Whether button is in loading state */
  readonly isLoading?: boolean;
  /** Whether button is disabled */
  readonly disabled?: boolean;
  /** Button click handler */
  readonly onClick?: () => void;
  /** Button content */
  readonly children: React.ReactNode;
  /** Additional CSS classes */
  readonly className?: string;
  /** Button type attribute */
  readonly type?: 'button' | 'submit' | 'reset';
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid Location.
 *
 * @param value - Value to check
 * @returns True if value is a valid Location
 *
 * @example
 * ```typescript
 * const maybeLocation: unknown = { lat: 40.66, lng: -7.91 };
 * if (isLocation(maybeLocation)) {
 *   console.log(maybeLocation.lat); // TypeScript knows this is a number
 * }
 * ```
 */
export function isLocation(value: unknown): value is Location {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['lat'] === 'number' &&
    typeof obj['lng'] === 'number' &&
    (obj['address'] === undefined || typeof obj['address'] === 'string') &&
    (obj['freguesia'] === undefined || typeof obj['freguesia'] === 'string')
  );
}

/**
 * Type guard to check if a value is a valid CategoryV2.
 *
 * @param value - Value to check
 * @returns True if value is a valid CategoryV2
 */
export function isCategoryV2(value: unknown): value is CategoryV2 {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['label'] === 'string' &&
    typeof obj['sublabel'] === 'string' &&
    typeof obj['departamento'] === 'string' &&
    typeof obj['email'] === 'string' &&
    typeof obj['color'] === 'string' &&
    typeof obj['iconPath'] === 'string'
  );
}

/**
 * Type guard to check if a value is a valid UrgencyV2.
 *
 * @param value - Value to check
 * @returns True if value is a valid UrgencyV2
 */
export function isUrgencyV2(value: unknown): value is UrgencyV2 {
  return value === 'pouco_urgente' || value === 'urgente' || value === 'perigoso';
}

/**
 * Type guard to check if a value is a valid Photo.
 *
 * @param value - Value to check
 * @returns True if value is a valid Photo
 */
export function isPhoto(value: unknown): value is Photo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    obj['file'] instanceof File &&
    typeof obj['preview'] === 'string'
  );
}

/**
 * Type guard to check if API response is successful.
 *
 * @param response - API response to check
 * @returns True if response indicates success
 */
export function isGenerateLetterSuccess(
  response: GenerateLetterResult
): response is GenerateLetterResponse {
  return 'success' in response && response.success === true;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Makes all properties of T deeply readonly.
 *
 * @template T - Object type to make deeply readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Makes all properties of T optional recursively.
 *
 * @template T - Object type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extracts the payload type for a specific wizard action.
 *
 * @template A - The action type to extract from
 * @template T - The specific action type string
 *
 * @example
 * ```typescript
 * type LocationPayload = ActionPayload<WizardActionV2, 'SET_LOCATION'>; // Location
 * ```
 */
export type ActionPayload<
  A extends { type: string },
  T extends A['type']
> = Extract<A, { type: T }> extends { payload: infer P } ? P : never;

/**
 * Creates a type with only the specified keys from T.
 *
 * @template T - Source object type
 * @template K - Keys to pick
 */
export type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Creates a type that requires at least one of the specified keys.
 *
 * @template T - Source object type
 * @template K - Keys where at least one must be present
 */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> = Omit<T, K> &
  {
    [P in K]-?: Required<Pick<T, P>> & Partial<Pick<T, Exclude<K, P>>>;
  }[K];

/**
 * Utility for exhaustive switch statements.
 * Call with the switch variable in the default case to get compile-time
 * errors when not all cases are handled.
 *
 * @param x - Value that should be of type never if all cases are handled
 * @throws Error at runtime if called (indicates missing case)
 *
 * @example
 * ```typescript
 * function handleUrgency(urgency: UrgencyV2): string {
 *   switch (urgency) {
 *     case 'pouco_urgente': return 'Low';
 *     case 'urgente': return 'Medium';
 *     case 'perigoso': return 'High';
 *     default:
 *       return assertNever(urgency); // Compile error if case is missing
 *   }
 * }
 * ```
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Note: Specific component types are co-located with their implementations
// and re-exported through barrel files in each component directory.
