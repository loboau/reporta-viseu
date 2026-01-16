/**
 * Input Sanitization for AI/LLM Requests
 *
 * Protects against:
 * - Prompt injection attacks
 * - Excessive input length
 * - Malicious content
 * - PII exposure
 * - XSS attempts
 */

interface SanitizationResult {
  isValid: boolean
  sanitizedValue: string
  errors: string[]
  warnings: string[]
  wasModified: boolean
  metadata: {
    originalLength: number
    sanitizedLength: number
    removedPatterns: string[]
  }
}

/**
 * Known prompt injection patterns to detect and block
 */
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?)/gi,
  /forget\s+(previous|all|above|prior)\s+(instructions?|prompts?)/gi,

  // System message attempts
  /\[?\s*system\s*\]?:/gi,
  /<\s*system\s*>/gi,
  /\{\s*system\s*\}/gi,

  // Role-play attempts
  /you\s+are\s+now/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /act\s+as\s+(if|a|an)/gi,
  /roleplay\s+as/gi,

  // Prompt boundary markers
  /---\s*end\s+(of\s+)?(prompt|instruction)/gi,
  /###\s*(system|instruction|prompt)/gi,

  // Function/code injection attempts
  /<\s*script\s*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers like onclick=
  /eval\s*\(/gi,

  // Data extraction attempts
  /show\s+me\s+(your|the)\s+(prompt|instructions?|system\s+message)/gi,
  /what\s+(are|is)\s+(your|the)\s+(instructions?|prompt|rules)/gi,
  /reveal\s+(your|the)\s+prompt/gi,

  // Jailbreak attempts
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /bypass\s+(safety|filters?|restrictions?)/gi,
]

/**
 * PII patterns to detect (but not necessarily block)
 */
const PII_PATTERNS = [
  // Portuguese ID card (Cartão de Cidadão)
  {
    pattern: /\b\d{8}\s?\d{1}\s?[A-Z]{2}\d{1}\b/g,
    type: 'Portuguese ID Card',
  },
  // Portuguese NIF (tax ID)
  {
    pattern: /\b[1-9]\d{8}\b/g,
    type: 'Portuguese NIF',
  },
  // Credit card numbers (basic pattern)
  {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    type: 'Credit Card Number',
  },
  // IBAN
  {
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
    type: 'IBAN',
  },
  // Email (already captured separately, but included for PII detection)
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: 'Email',
  },
  // Portuguese phone numbers
  {
    pattern: /\b(9[1236]\d{7}|2\d{8})\b/g,
    type: 'Phone Number',
  },
]

/**
 * Malicious content patterns
 */
const MALICIOUS_PATTERNS = [
  /<\s*iframe\s*>/gi,
  /<\s*object\s*>/gi,
  /<\s*embed\s*>/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
]

/**
 * Sanitize user input for AI processing
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number
    allowPII?: boolean
    strictMode?: boolean
  } = {}
): SanitizationResult {
  const {
    maxLength = 2000,
    allowPII = true,
    strictMode = false,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  const removedPatterns: string[] = []
  let sanitized = input
  const originalLength = input.length

  // 1. Basic validation
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Input must be a non-empty string'],
      warnings: [],
      wasModified: false,
      metadata: {
        originalLength: 0,
        sanitizedLength: 0,
        removedPatterns: [],
      },
    }
  }

  // 2. Length validation
  if (input.length > maxLength) {
    errors.push(`Input exceeds maximum length of ${maxLength} characters`)
    sanitized = sanitized.substring(0, maxLength)
    warnings.push(`Input was truncated to ${maxLength} characters`)
  }

  if (input.trim().length === 0) {
    return {
      isValid: false,
      sanitizedValue: '',
      errors: ['Input cannot be empty or whitespace only'],
      warnings: [],
      wasModified: false,
      metadata: {
        originalLength,
        sanitizedLength: 0,
        removedPatterns: [],
      },
    }
  }

  // 3. Check for prompt injection attempts
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      errors.push(`Potential prompt injection detected: ${matches[0]}`)
      removedPatterns.push(pattern.source)

      // In strict mode, reject the entire input
      if (strictMode) {
        return {
          isValid: false,
          sanitizedValue: '',
          errors,
          warnings,
          wasModified: true,
          metadata: {
            originalLength,
            sanitizedLength: 0,
            removedPatterns,
          },
        }
      }

      // Otherwise, remove the suspicious pattern
      sanitized = sanitized.replace(pattern, '[REMOVED]')
    }
  }

  // 4. Check for malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      errors.push('Malicious content pattern detected')
      sanitized = sanitized.replace(pattern, '[REMOVED]')
      removedPatterns.push(pattern.source)
    }
  }

  // 5. PII detection (warn but don't necessarily block)
  if (!allowPII) {
    for (const { pattern, type } of PII_PATTERNS) {
      const matches = sanitized.match(pattern)
      if (matches) {
        warnings.push(`Potential ${type} detected`)
        // Optionally redact in strict mode
        if (strictMode) {
          sanitized = sanitized.replace(pattern, '[REDACTED]')
          removedPatterns.push(type)
        }
      }
    }
  }

  // 6. Normalize whitespace
  sanitized = sanitized
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim()

  // 7. Remove excessive punctuation (potential obfuscation)
  sanitized = sanitized.replace(/([!?.,])\1{3,}/g, '$1$1') // Max 2 repeated punctuation

  // 8. Escape potentially dangerous characters while preserving Portuguese
  // We don't want to break Portuguese text, but we need to be careful
  sanitized = sanitized
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces

  const wasModified = sanitized !== input
  const isValid = errors.length === 0

  return {
    isValid,
    sanitizedValue: sanitized,
    errors,
    warnings,
    wasModified,
    metadata: {
      originalLength,
      sanitizedLength: sanitized.length,
      removedPatterns,
    },
  }
}

/**
 * Validate report data structure
 */
export function validateReportData(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!data.category) {
    errors.push('Category is required')
  }

  if (!data.location) {
    errors.push('Location is required')
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description must be a string')
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters')
  } else if (data.description.length > 2000) {
    errors.push('Description must not exceed 2000 characters')
  }

  // Validate urgency
  const validUrgencies = ['baixa', 'media', 'alta']
  if (data.urgency && !validUrgencies.includes(data.urgency)) {
    errors.push('Invalid urgency level')
  }

  // Validate coordinates if present
  if (data.location) {
    if (typeof data.location.lat !== 'number' ||
        data.location.lat < -90 ||
        data.location.lat > 90) {
      errors.push('Invalid latitude')
    }
    if (typeof data.location.lng !== 'number' ||
        data.location.lng < -180 ||
        data.location.lng > 180) {
      errors.push('Invalid longitude')
    }
  }

  // Validate contact info if not anonymous
  if (!data.isAnonymous) {
    if (data.email && typeof data.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format')
      }
    }

    if (data.phone && typeof data.phone === 'string') {
      // Portuguese phone validation
      const phoneRegex = /^[+]?[0-9\s-()]{9,20}$/
      if (!phoneRegex.test(data.phone)) {
        errors.push('Invalid phone format')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate estimated token count for input
 * (Rough estimate: 1 token ≈ 4 characters for Portuguese)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

export type { SanitizationResult }
