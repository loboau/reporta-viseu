/**
 * API Input Validation and Sanitization Utilities
 *
 * Provides comprehensive validation and sanitization for all API inputs
 * to prevent injection attacks, XSS, and data integrity issues.
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ValidationResult<T = any> {
  valid: boolean
  data?: T
  errors?: string[]
}

export interface ReportDataInput {
  location: {
    lat: number
    lng: number
    address?: string
    freguesia?: string
  } | null
  category: {
    id: string
    label: string
    departamento: string
    email: string
  } | null
  description: string
  urgency: 'baixa' | 'media' | 'alta'
  isAnonymous: boolean
  name?: string
  email?: string
  phone?: string
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION_RULES = {
  // String length limits
  STRING_LIMITS: {
    description: { min: 10, max: 2000 },
    name: { min: 2, max: 100 },
    email: { min: 5, max: 100 },
    phone: { min: 9, max: 20 },
    address: { min: 5, max: 300 },
    freguesia: { min: 2, max: 100 },
    categoryId: { min: 1, max: 50 },
    categoryLabel: { min: 2, max: 100 },
    departamento: { min: 2, max: 100 },
  },

  // Coordinate limits (Portugal bounds + buffer)
  COORDINATES: {
    lat: { min: 36.0, max: 42.0 }, // Portugal latitude range
    lng: { min: -10.0, max: -6.0 }, // Portugal longitude range
  },

  // Email pattern (RFC 5322 simplified)
  EMAIL_PATTERN:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  // Phone pattern (Portuguese phone numbers)
  PHONE_PATTERN: /^(\+351\s?)?[0-9]{9}$/,

  // Urgency levels
  URGENCY_LEVELS: ['baixa', 'media', 'alta'] as const,
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize HTML-safe string (allows some formatting)
 */
export function sanitizeDescription(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, etc.)
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '')
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult<string> {
  if (!value || value.length < min) {
    return {
      valid: false,
      errors: [`${fieldName} must be at least ${min} characters`],
    }
  }

  if (value.length > max) {
    return {
      valid: false,
      errors: [`${fieldName} must be at most ${max} characters`],
    }
  }

  return {
    valid: true,
    data: value,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult<string> {
  const sanitized = sanitizeEmail(email)

  if (!VALIDATION_RULES.EMAIL_PATTERN.test(sanitized)) {
    return {
      valid: false,
      errors: ['Invalid email format'],
    }
  }

  const lengthCheck = validateStringLength(
    sanitized,
    VALIDATION_RULES.STRING_LIMITS.email.min,
    VALIDATION_RULES.STRING_LIMITS.email.max,
    'Email'
  )

  if (!lengthCheck.valid) {
    return lengthCheck
  }

  return {
    valid: true,
    data: sanitized,
  }
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult<string> {
  const sanitized = sanitizePhone(phone)

  if (!VALIDATION_RULES.PHONE_PATTERN.test(sanitized)) {
    return {
      valid: false,
      errors: ['Invalid phone number format. Expected format: 912345678 or +351912345678'],
    }
  }

  return {
    valid: true,
    data: sanitized,
  }
}

/**
 * Validate coordinates
 */
export function validateCoordinates(
  lat: number,
  lng: number
): ValidationResult<{ lat: number; lng: number }> {
  const errors: string[] = []

  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a valid number')
  } else if (lat < VALIDATION_RULES.COORDINATES.lat.min || lat > VALIDATION_RULES.COORDINATES.lat.max) {
    errors.push(
      `Latitude must be between ${VALIDATION_RULES.COORDINATES.lat.min} and ${VALIDATION_RULES.COORDINATES.lat.max}`
    )
  }

  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push('Longitude must be a valid number')
  } else if (lng < VALIDATION_RULES.COORDINATES.lng.min || lng > VALIDATION_RULES.COORDINATES.lng.max) {
    errors.push(
      `Longitude must be between ${VALIDATION_RULES.COORDINATES.lng.min} and ${VALIDATION_RULES.COORDINATES.lng.max}`
    )
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    }
  }

  return {
    valid: true,
    data: { lat, lng },
  }
}

/**
 * Validate urgency level
 */
export function validateUrgency(
  urgency: string
): ValidationResult<'baixa' | 'media' | 'alta'> {
  if (!VALIDATION_RULES.URGENCY_LEVELS.includes(urgency as any)) {
    return {
      valid: false,
      errors: [`Urgency must be one of: ${VALIDATION_RULES.URGENCY_LEVELS.join(', ')}`],
    }
  }

  return {
    valid: true,
    data: urgency as 'baixa' | 'media' | 'alta',
  }
}

// ============================================================================
// COMPREHENSIVE REPORT DATA VALIDATION
// ============================================================================

/**
 * Validate complete report data
 */
export function validateReportData(data: any): ValidationResult<ReportDataInput> {
  const errors: string[] = []

  // Check if data exists
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Invalid request data'],
    }
  }

  // Validate location
  if (!data.location || typeof data.location !== 'object') {
    errors.push('Location is required')
  } else {
    const coordsResult = validateCoordinates(data.location.lat, data.location.lng)
    if (!coordsResult.valid) {
      errors.push(...(coordsResult.errors || []))
    }

    // Validate optional address
    if (data.location.address) {
      const addressResult = validateStringLength(
        data.location.address,
        VALIDATION_RULES.STRING_LIMITS.address.min,
        VALIDATION_RULES.STRING_LIMITS.address.max,
        'Address'
      )
      if (!addressResult.valid) {
        errors.push(...(addressResult.errors || []))
      } else {
        data.location.address = sanitizeString(addressResult.data!)
      }
    }

    // Validate optional freguesia
    if (data.location.freguesia) {
      const freguesiaResult = validateStringLength(
        data.location.freguesia,
        VALIDATION_RULES.STRING_LIMITS.freguesia.min,
        VALIDATION_RULES.STRING_LIMITS.freguesia.max,
        'Freguesia'
      )
      if (!freguesiaResult.valid) {
        errors.push(...(freguesiaResult.errors || []))
      } else {
        data.location.freguesia = sanitizeString(freguesiaResult.data!)
      }
    }
  }

  // Validate category
  if (!data.category || typeof data.category !== 'object') {
    errors.push('Category is required')
  } else {
    // Validate category ID
    if (!data.category.id) {
      errors.push('Category ID is required')
    } else {
      const idResult = validateStringLength(
        data.category.id,
        VALIDATION_RULES.STRING_LIMITS.categoryId.min,
        VALIDATION_RULES.STRING_LIMITS.categoryId.max,
        'Category ID'
      )
      if (!idResult.valid) {
        errors.push(...(idResult.errors || []))
      }
    }

    // Validate category label
    if (!data.category.label) {
      errors.push('Category label is required')
    } else {
      const labelResult = validateStringLength(
        data.category.label,
        VALIDATION_RULES.STRING_LIMITS.categoryLabel.min,
        VALIDATION_RULES.STRING_LIMITS.categoryLabel.max,
        'Category label'
      )
      if (!labelResult.valid) {
        errors.push(...(labelResult.errors || []))
      } else {
        data.category.label = sanitizeString(labelResult.data!)
      }
    }

    // Validate email
    if (!data.category.email) {
      errors.push('Category email is required')
    } else {
      const emailResult = validateEmail(data.category.email)
      if (!emailResult.valid) {
        errors.push(`Category email: ${emailResult.errors?.join(', ')}`)
      } else {
        data.category.email = emailResult.data!
      }
    }
  }

  // Validate description
  if (!data.description) {
    errors.push('Description is required')
  } else {
    const descResult = validateStringLength(
      data.description,
      VALIDATION_RULES.STRING_LIMITS.description.min,
      VALIDATION_RULES.STRING_LIMITS.description.max,
      'Description'
    )
    if (!descResult.valid) {
      errors.push(...(descResult.errors || []))
    } else {
      data.description = sanitizeDescription(descResult.data!)
    }
  }

  // Validate urgency
  if (!data.urgency) {
    errors.push('Urgency is required')
  } else {
    const urgencyResult = validateUrgency(data.urgency)
    if (!urgencyResult.valid) {
      errors.push(...(urgencyResult.errors || []))
    }
  }

  // Validate isAnonymous
  if (typeof data.isAnonymous !== 'boolean') {
    errors.push('isAnonymous must be a boolean')
  }

  // Validate contact information (if not anonymous)
  if (!data.isAnonymous) {
    // Name is required for non-anonymous
    if (!data.name) {
      errors.push('Name is required for non-anonymous reports')
    } else {
      const nameResult = validateStringLength(
        data.name,
        VALIDATION_RULES.STRING_LIMITS.name.min,
        VALIDATION_RULES.STRING_LIMITS.name.max,
        'Name'
      )
      if (!nameResult.valid) {
        errors.push(...(nameResult.errors || []))
      } else {
        data.name = sanitizeString(nameResult.data!)
      }
    }

    // Email is required for non-anonymous
    if (!data.email) {
      errors.push('Email is required for non-anonymous reports')
    } else {
      const emailResult = validateEmail(data.email)
      if (!emailResult.valid) {
        errors.push(`Email: ${emailResult.errors?.join(', ')}`)
      } else {
        data.email = emailResult.data!
      }
    }

    // Phone is optional
    if (data.phone) {
      const phoneResult = validatePhone(data.phone)
      if (!phoneResult.valid) {
        errors.push(`Phone: ${phoneResult.errors?.join(', ')}`)
      } else {
        data.phone = phoneResult.data!
      }
    }
  }

  // Return result
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    }
  }

  return {
    valid: true,
    data: data as ReportDataInput,
  }
}

// ============================================================================
// EXPRESS/NEXT.JS MIDDLEWARE HELPERS
// ============================================================================

/**
 * Create validation middleware for API routes
 */
export function createValidationMiddleware<T>(
  validator: (data: any) => ValidationResult<T>
) {
  return async (request: NextRequest): Promise<ValidationResult<T>> => {
    try {
      // Parse JSON body
      const body = await request.json()

      // Validate
      return validator(body)
    } catch (error) {
      return {
        valid: false,
        errors: ['Invalid JSON in request body'],
      }
    }
  }
}

/**
 * Return validation error response
 */
export function validationErrorResponse(errors: string[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// In API route:
import { validateReportData, validationErrorResponse } from '@/lib/api-validation'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validationResult = validateReportData(body)

  if (!validationResult.valid) {
    return validationErrorResponse(validationResult.errors || [])
  }

  const data = validationResult.data!
  // Proceed with validated and sanitized data...
}
*/
