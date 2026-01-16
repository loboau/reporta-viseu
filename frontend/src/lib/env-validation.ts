/**
 * Environment Variable Validation Utility
 *
 * Validates and sanitizes environment variables at runtime to prevent
 * configuration errors and security issues.
 *
 * Usage:
 *   import { validateEnv } from '@/lib/env-validation'
 *   const env = validateEnv()
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ValidatedEnv {
  GEMINI_API_KEY: string
  NODE_ENV: 'development' | 'production' | 'test'
  VERCEL_ENV?: 'development' | 'preview' | 'production'
  VERCEL_URL?: string
}

export class EnvValidationError extends Error {
  constructor(
    message: string,
    public readonly missingVars: string[] = [],
    public readonly invalidVars: string[] = []
  ) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationRule {
  required: boolean
  validator?: (value: string) => boolean
  sanitizer?: (value: string) => string
  errorMessage?: string
}

const ENV_RULES: Record<string, ValidationRule> = {
  GEMINI_API_KEY: {
    required: true,
    validator: (value) => {
      // Google API keys start with "AIza" and are 39 characters
      return value.startsWith('AIza') && value.length === 39
    },
    sanitizer: (value) => value.trim(),
    errorMessage: 'GEMINI_API_KEY must start with "AIza" and be 39 characters long',
  },
  NODE_ENV: {
    required: true,
    validator: (value) => ['development', 'production', 'test'].includes(value),
    errorMessage: 'NODE_ENV must be "development", "production", or "test"',
  },
  VERCEL_ENV: {
    required: false,
    validator: (value) => ['development', 'preview', 'production'].includes(value),
    errorMessage: 'VERCEL_ENV must be "development", "preview", or "production"',
  },
  VERCEL_URL: {
    required: false,
    validator: (value) => {
      try {
        new URL(`https://${value}`)
        return true
      } catch {
        return false
      }
    },
    errorMessage: 'VERCEL_URL must be a valid domain',
  },
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single environment variable
 */
function validateEnvVar(
  name: string,
  value: string | undefined,
  rule: ValidationRule
): {
  valid: boolean
  sanitized?: string
  error?: string
} {
  // Check if required
  if (rule.required && !value) {
    return {
      valid: false,
      error: `${name} is required but not set`,
    }
  }

  // Skip validation if not required and not set
  if (!rule.required && !value) {
    return { valid: true }
  }

  // Sanitize value
  const sanitized = rule.sanitizer ? rule.sanitizer(value!) : value!

  // Validate
  if (rule.validator && !rule.validator(sanitized)) {
    return {
      valid: false,
      error: rule.errorMessage || `${name} has invalid format`,
    }
  }

  return {
    valid: true,
    sanitized,
  }
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidatedEnv {
  const errors: string[] = []
  const missingVars: string[] = []
  const invalidVars: string[] = []
  const validatedEnv: Partial<ValidatedEnv> = {}

  // Validate each environment variable
  for (const [name, rule] of Object.entries(ENV_RULES)) {
    const value = process.env[name]
    const result = validateEnvVar(name, value, rule)

    if (!result.valid) {
      errors.push(result.error!)

      if (!value) {
        missingVars.push(name)
      } else {
        invalidVars.push(name)
      }
    } else if (result.sanitized) {
      // @ts-ignore - Dynamic assignment
      validatedEnv[name] = result.sanitized
    } else if (value) {
      // @ts-ignore - Dynamic assignment
      validatedEnv[name] = value
    }
  }

  // Throw error if validation failed
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment validation failed:',
      '',
      ...errors.map((err) => `  • ${err}`),
      '',
      'Please check your environment variables:',
      '  - Development: .env.local',
      '  - Production: Deployment platform environment settings',
    ].join('\n')

    throw new EnvValidationError(errorMessage, missingVars, invalidVars)
  }

  return validatedEnv as ValidatedEnv
}

/**
 * Validate environment at startup (with graceful handling)
 */
export function validateEnvAtStartup(): ValidatedEnv | null {
  try {
    const env = validateEnv()

    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Environment validation passed')
    } else {
      console.log('✅ Environment validation passed (development mode)')
    }

    return env
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(error.message)

      // In development, show helpful hints
      if (process.env.NODE_ENV === 'development') {
        console.log('\n💡 Hints:')
        console.log('  - Create a .env.local file in the frontend directory')
        console.log('  - Copy .env.example if available')
        console.log('  - Get your Gemini API key from: https://aistudio.google.com/app/apikey')
        console.log('')
      }

      // In production, fail hard
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    } else {
      console.error('❌ Unexpected error during environment validation:', error)
    }

    return null
  }
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(name: keyof ValidatedEnv): string {
  const env = validateEnv()
  return env[name] || ''
}

/**
 * Check if environment is properly configured
 */
export function isEnvConfigured(): boolean {
  try {
    validateEnv()
    return true
  } catch {
    return false
  }
}

/**
 * Get sanitized environment info (safe for logging)
 */
export function getSafeEnvInfo(): Record<string, string> {
  return {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not-vercel',
    HAS_GEMINI_KEY: process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set',
    // Never log actual API keys!
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// At app startup (e.g., in next.config.js or API route):
import { validateEnvAtStartup } from '@/lib/env-validation'

const env = validateEnvAtStartup()
if (!env) {
  console.error('Failed to start: Invalid environment configuration')
}

// In API routes:
import { getEnvVar } from '@/lib/env-validation'

export async function POST(request: NextRequest) {
  const apiKey = getEnvVar('GEMINI_API_KEY')
  // Use apiKey safely...
}

// Check before operations:
import { isEnvConfigured } from '@/lib/env-validation'

if (!isEnvConfigured()) {
  return NextResponse.json(
    { error: 'Service temporarily unavailable' },
    { status: 503 }
  )
}
*/
