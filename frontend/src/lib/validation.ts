/**
 * Comprehensive input validation and XSS protection utilities
 * for the Viseu Reporta V2 application
 */

import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Portuguese phone number patterns
 * - Mobile: 9XX XXX XXX (starting with 91, 92, 93, 96)
 * - Landline: 2XX XXX XXX
 */
const PORTUGUESE_MOBILE_REGEX = /^(\+351\s?)?9[1236]\d{7}$/
const PORTUGUESE_LANDLINE_REGEX = /^(\+351\s?)?2\d{8}$/
const PORTUGUESE_PHONE_FLEXIBLE_REGEX = /^(\+351\s?)?[29]\d[\s-]?\d{3}[\s-]?\d{3}$/

/**
 * Email validation regex - RFC 5322 compliant
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Maximum number of photos
 */
export const MAX_PHOTOS = 5

// ============================================================================
// TEXT SANITIZATION
// ============================================================================

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify to strip out dangerous HTML/JavaScript
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return ''

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true, // Keep text content
  })
}

/**
 * Sanitizes plain text input by removing/escaping dangerous characters
 * - Removes control characters
 * - Trims whitespace
 * - Limits length
 */
export function sanitizePlainText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return ''

  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitizes name input
 * - Allows letters, spaces, hyphens, apostrophes
 * - Removes numbers and special characters that don't belong in names
 *
 * NOTE: Does NOT trim to allow natural typing with spaces between names.
 * Trimming should happen at validation/submission time.
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return ''

  return name
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '') // Only allow letters, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .replace(/^\s+/, '') // Only trim leading spaces (not trailing, to allow typing)
    .slice(0, 100)
}

/**
 * Sanitizes email input
 * - Converts to lowercase
 * - Removes whitespace
 * - Removes invalid characters
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return ''

  return email
    .toLowerCase()
    .trim()
    .replace(/\s/g, '')
    .slice(0, 254) // RFC 5321 max length
}

/**
 * Sanitizes phone number input
 * - Removes all non-numeric characters except + at the start
 * - Formats consistently
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''

  // Remove all whitespace and special characters except + at the start
  let cleaned = phone.trim().replace(/[\s\-()]/g, '')

  // Ensure + is only at the start
  if (cleaned.includes('+')) {
    const hasPrefix = cleaned.startsWith('+')
    cleaned = cleaned.replace(/\+/g, '')
    if (hasPrefix) cleaned = '+' + cleaned
  }

  return cleaned.slice(0, 20)
}

/**
 * Sanitizes description/textarea input
 * - Strips HTML tags
 * - Removes excessive whitespace (but preserves trailing spaces for typing)
 * - Prevents script injection
 *
 * NOTE: Does NOT trim to allow natural typing with spaces.
 * Trimming should happen at validation/submission time.
 */
export function sanitizeDescription(description: string): string {
  if (!description || typeof description !== 'string') return ''

  // First pass: strip HTML
  let sanitized = sanitizeHtml(description)

  // Remove excessive line breaks (max 2 consecutive)
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n')

  // Remove excessive spaces (but keep single/double spaces for natural typing)
  sanitized = sanitized.replace(/ {3,}/g, '  ')

  // Limit length only - NO trim to preserve trailing spaces during typing
  return sanitized.slice(0, 2000)
}

/**
 * Sanitizes address input from reverse geocoding
 * - Strips HTML to prevent XSS from external API
 * - Preserves special characters needed for addresses
 */
export function sanitizeAddress(address: string): string {
  if (!address || typeof address !== 'string') return ''

  return sanitizeHtml(address)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .max(254, 'Email demasiado longo')
  .regex(EMAIL_REGEX, 'Formato de email inválido')
  .email('Email inválido')
  .transform(sanitizeEmail)

/**
 * Portuguese phone validation schema
 * Accepts mobile and landline formats with or without country code
 */
export const phoneSchema = z
  .string()
  .optional()
  .transform((val) => (val ? sanitizePhone(val) : ''))
  .refine(
    (val) => {
      if (!val) return true // Optional field

      // Remove formatting for validation
      const cleaned = val.replace(/[\s\-()]/g, '')

      return (
        PORTUGUESE_MOBILE_REGEX.test(cleaned) ||
        PORTUGUESE_LANDLINE_REGEX.test(cleaned) ||
        PORTUGUESE_PHONE_FLEXIBLE_REGEX.test(cleaned)
      )
    },
    {
      message: 'Número de telefone português inválido. Use formato: 912 345 678 ou 234 567 890',
    }
  )

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome demasiado longo')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
  .transform(sanitizeName)
  .refine((val) => val.split(' ').length >= 2, {
    message: 'Por favor, forneça o nome completo (nome e apelido)',
  })

/**
 * Description validation schema
 */
export const descriptionSchema = z
  .string()
  .min(10, 'A descrição deve ter pelo menos 10 caracteres')
  .max(2000, 'A descrição não pode exceder 2000 caracteres')
  .transform(sanitizeDescription)
  .refine(
    (val) => {
      // Check for script injection attempts
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // Event handlers like onclick=
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ]
      return !dangerousPatterns.some((pattern) => pattern.test(val))
    },
    {
      message: 'A descrição contém conteúdo não permitido',
    }
  )

/**
 * Address validation schema
 */
export const addressSchema = z
  .string()
  .min(1, 'Morada é obrigatória')
  .max(500, 'Morada demasiado longa')
  .transform(sanitizeAddress)

/**
 * Coordinates validation schema
 */
export const coordinatesSchema = z.object({
  lat: z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'),
  lng: z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida'),
})

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

/**
 * Contact information validation schema
 * Used in Step 3 of the wizard
 */
export const contactInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
})

/**
 * Anonymous contact validation schema
 */
export const anonymousContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
})

/**
 * Report data validation schema
 */
export const reportDataSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: addressSchema.optional(),
    freguesia: z.string().optional(),
  }),
  category: z.object({
    id: z.string(),
    label: z.string(),
    departamento: z.string(),
    email: emailSchema,
  }),
  description: descriptionSchema,
  urgency: z.enum(['pouco_urgente', 'urgente', 'perigoso']),
  isAnonymous: z.boolean(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
})

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validates file type by checking MIME type and extension
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Tipo de ficheiro não suportado: ${file.type}. Use apenas JPG, PNG ou WebP.`,
    }
  }

  // Check file extension as additional validation
  const extension = file.name.toLowerCase().split('.').pop()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de ficheiro não suportada: .${extension}`,
    }
  }

  return { valid: true }
}

/**
 * Validates file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `Ficheiro muito grande: ${sizeMB}MB. Tamanho máximo: 5MB.`,
    }
  }

  return { valid: true }
}

/**
 * Validates image file dimensions (optional check)
 */
export async function validateImageDimensions(
  file: File,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Imagem muito grande: ${img.width}x${img.height}px. Máximo: ${maxWidth}x${maxHeight}px.`,
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        valid: false,
        error: 'Não foi possível carregar a imagem. Ficheiro pode estar corrompido.',
      })
    }

    img.src = objectUrl
  })
}

/**
 * Comprehensive file validation
 */
export async function validatePhotoFile(
  file: File,
  options: {
    checkDimensions?: boolean
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  // Check file type
  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) return typeValidation

  // Check file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) return sizeValidation

  // Optionally check dimensions
  if (options.checkDimensions) {
    const dimensionsValidation = await validateImageDimensions(
      file,
      options.maxWidth,
      options.maxHeight
    )
    if (!dimensionsValidation.valid) return dimensionsValidation
  }

  return { valid: true }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates email with detailed error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || 'Email inválido' }
    }
    return { valid: false, error: 'Erro ao validar email' }
  }
}

/**
 * Validates phone number with detailed error message
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: true } // Phone is optional
  }

  try {
    phoneSchema.parse(phone)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || 'Telefone inválido' }
    }
    return { valid: false, error: 'Erro ao validar telefone' }
  }
}

/**
 * Validates name with detailed error message
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  try {
    nameSchema.parse(name)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || 'Nome inválido' }
    }
    return { valid: false, error: 'Erro ao validar nome' }
  }
}

/**
 * Validates description with detailed error message
 */
export function validateDescription(description: string): { valid: boolean; error?: string } {
  try {
    descriptionSchema.parse(description)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || 'Descrição inválida' }
    }
    return { valid: false, error: 'Erro ao validar descrição' }
  }
}

/**
 * Validates all contact information at once
 */
export function validateContactInfo(data: {
  name: string
  email: string
  phone?: string
}): {
  valid: boolean
  errors?: {
    name?: string
    email?: string
    phone?: string
  }
} {
  try {
    contactInfoSchema.parse(data)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err) => {
        const field = err.path[0] as string
        errors[field] = err.message
      })
      return { valid: false, errors }
    }
    return { valid: false, errors: { name: 'Erro ao validar dados de contacto' } }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a string contains potential XSS payloads
 */
export function containsXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * Escapes HTML entities to prevent XSS when displaying user content
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return ''

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  // Portuguese mobile: 9XX XXX XXX
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  // Portuguese landline: 2XX XXX XXX
  if (cleaned.length === 9 && cleaned.startsWith('2')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  // With country code: +351 9XX XXX XXX
  if (cleaned.length === 12 && cleaned.startsWith('351')) {
    return `+351 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }

  return phone
}
