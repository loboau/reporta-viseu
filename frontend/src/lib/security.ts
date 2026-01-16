/**
 * Security Utilities for Viseu Reporta V2
 *
 * This module provides security utilities for:
 * - Data sanitization and validation
 * - Secure storage patterns
 * - Error handling without exposing internals
 * - Memory leak prevention
 * - PII (Personally Identifiable Information) redaction
 */

// ============================================================================
// DATA SANITIZATION & VALIDATION
// ============================================================================

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validates email format without exposing regex details in errors
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number format (Portuguese format)
 */
export function isValidPhone(phone: string): boolean {
  // Portuguese phone: 9 digits, optionally starting with +351
  const phoneRegex = /^(\+351\s?)?[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Sanitizes file names to prevent directory traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 255) // Limit length
}

/**
 * Validates that coordinates are within reasonable bounds
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

// ============================================================================
// PII REDACTION FOR LOGGING
// ============================================================================

/**
 * Redacts email addresses for logging purposes
 * Example: john.doe@example.com -> j***@e***.com
 */
export function redactEmail(email: string): string {
  if (!email || !email.includes('@')) return '[REDACTED]'

  const parts = email.split('@')
  const local = parts[0]
  const domain = parts[1]

  if (!local || !domain) return '[REDACTED]'

  const domainParts = domain.split('.')

  const redactedLocal = local.charAt(0) + '***'
  const firstDomainPart = domainParts[0]
  const lastDomainPart = domainParts[domainParts.length - 1]
  const redactedDomain = domainParts.length > 1 && firstDomainPart && lastDomainPart
    ? `${firstDomainPart.charAt(0)}***.${lastDomainPart}`
    : '***'

  return `${redactedLocal}@${redactedDomain}`
}

/**
 * Redacts phone numbers for logging purposes
 * Example: 912345678 -> 91***5678
 */
export function redactPhone(phone: string): string {
  if (!phone) return '[REDACTED]'
  const digits = phone.replace(/\D/g, '')

  if (digits.length < 6) return '***'

  return digits.substring(0, 2) + '***' + digits.substring(digits.length - 4)
}

/**
 * Redacts personal name for logging
 * Example: João Silva -> J*** S***
 */
export function redactName(name: string): string {
  if (!name) return '[REDACTED]'

  const parts = name.trim().split(/\s+/)
  return parts.map(part => part.charAt(0) + '***').join(' ')
}

/**
 * Creates a safe version of report data for logging
 * Removes all PII and sensitive information
 */
export function createSafeLogData(data: any): any {
  const safe: any = {}

  if (data.location) {
    safe.location = {
      // Reduce precision to ~100m for privacy
      lat: Number(data.location.lat?.toFixed(3)),
      lng: Number(data.location.lng?.toFixed(3)),
      hasAddress: Boolean(data.location.address),
      hasFreguesia: Boolean(data.location.freguesia),
    }
  }

  if (data.category) {
    safe.category = {
      id: data.category.id,
      label: data.category.label,
    }
  }

  safe.descriptionLength = data.description?.length || 0
  safe.photoCount = data.photos?.length || 0
  safe.urgency = data.urgency
  safe.isAnonymous = data.isAnonymous

  // Redact PII if present
  if (data.name && !data.isAnonymous) {
    safe.name = redactName(data.name)
  }

  if (data.email && !data.isAnonymous) {
    safe.email = redactEmail(data.email)
  }

  if (data.phone && !data.isAnonymous) {
    safe.phone = redactPhone(data.phone)
  }

  return safe
}

// ============================================================================
// SECURE ERROR HANDLING
// ============================================================================

export interface SafeError {
  message: string
  code: string
  timestamp: string
}

/**
 * Creates user-friendly error messages without exposing internals
 * Maps technical errors to safe, user-facing messages
 */
export function createSafeError(error: unknown, context?: string): SafeError {
  const timestamp = new Date().toISOString()

  // Default safe error
  const safeError: SafeError = {
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    code: 'UNKNOWN_ERROR',
    timestamp,
  }

  // Log the actual error for debugging (server-side only)
  if (typeof window === 'undefined') {
    console.error('[Security Error Handler]', {
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      timestamp,
    })
  }

  // Map known error types to safe messages
  if (error instanceof Error) {
    switch (error.name) {
      case 'AbortError':
        safeError.message = 'A operação foi cancelada. Por favor, tente novamente.'
        safeError.code = 'OPERATION_CANCELLED'
        break

      case 'TypeError':
        safeError.message = 'Dados inválidos. Verifique as informações inseridas.'
        safeError.code = 'INVALID_DATA'
        break

      case 'NetworkError':
        safeError.message = 'Erro de conexão. Verifique a sua ligação à internet.'
        safeError.code = 'NETWORK_ERROR'
        break

      case 'TimeoutError':
        safeError.message = 'A operação demorou demasiado tempo. Por favor, tente novamente.'
        safeError.code = 'TIMEOUT'
        break

      default:
        // Check error message for specific patterns
        if (error.message.includes('fetch')) {
          safeError.message = 'Erro ao comunicar com o servidor. Por favor, tente novamente.'
          safeError.code = 'FETCH_ERROR'
        } else if (error.message.includes('permission')) {
          safeError.message = 'Permissões insuficientes. Verifique as definições do navegador.'
          safeError.code = 'PERMISSION_DENIED'
        }
    }
  }

  return safeError
}

/**
 * Checks if an error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'NetworkError' ||
      error.message.includes('fetch') ||
      error.message.includes('network')
    )
  }
  return false
}

/**
 * Checks if an error is recoverable (user can retry)
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    const recoverableTypes = ['AbortError', 'NetworkError', 'TimeoutError']
    return recoverableTypes.includes(error.name)
  }
  return true // Assume recoverable by default
}

// ============================================================================
// SECURE STORAGE (LocalStorage/SessionStorage Wrapper)
// ============================================================================

export type StorageType = 'local' | 'session' | 'memory'

/**
 * Simple XOR-based obfuscation for sensitive data
 * Note: This is NOT encryption - just obfuscation to prevent casual viewing
 * For true security, use server-side encryption
 */
function obfuscate(data: string, key: string): string {
  let result = ''
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(result) // Base64 encode
}

function deobfuscate(data: string, key: string): string {
  try {
    const decoded = atob(data)
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  } catch {
    return ''
  }
}

// In-memory storage fallback
const memoryStorage = new Map<string, string>()

/**
 * Secure storage wrapper with automatic cleanup and obfuscation
 */
export class SecureStorage {
  private storageType: StorageType
  private obfuscationKey: string

  constructor(storageType: StorageType = 'memory', obfuscationKey?: string) {
    this.storageType = storageType
    this.obfuscationKey = obfuscationKey || 'viseu-reporta-v2'
  }

  private getStorage(): Storage | Map<string, string> | null {
    if (typeof window === 'undefined') return memoryStorage

    switch (this.storageType) {
      case 'local':
        return window.localStorage
      case 'session':
        return window.sessionStorage
      case 'memory':
      default:
        return memoryStorage
    }
  }

  /**
   * Stores data with optional obfuscation
   */
  setItem(key: string, value: unknown, shouldObfuscate = false): boolean {
    try {
      const storage = this.getStorage()
      if (!storage) return false

      const stringValue = JSON.stringify(value)
      const finalValue = shouldObfuscate
        ? obfuscate(stringValue, this.obfuscationKey)
        : stringValue

      if (storage instanceof Map) {
        storage.set(key, finalValue)
      } else {
        storage.setItem(key, finalValue)
      }

      return true
    } catch (error) {
      console.error('[SecureStorage] Failed to set item:', createSafeError(error, 'setItem'))
      return false
    }
  }

  /**
   * Retrieves data with automatic deobfuscation
   */
  getItem<T = any>(key: string, obfuscated = false): T | null {
    try {
      const storage = this.getStorage()
      if (!storage) return null

      const value = storage instanceof Map
        ? storage.get(key)
        : storage.getItem(key)

      if (!value) return null

      const stringValue = obfuscated
        ? deobfuscate(value, this.obfuscationKey)
        : value

      return JSON.parse(stringValue) as T
    } catch (error) {
      console.error('[SecureStorage] Failed to get item:', createSafeError(error, 'getItem'))
      return null
    }
  }

  /**
   * Removes an item from storage
   */
  removeItem(key: string): boolean {
    try {
      const storage = this.getStorage()
      if (!storage) return false

      if (storage instanceof Map) {
        storage.delete(key)
      } else {
        storage.removeItem(key)
      }

      return true
    } catch (error) {
      console.error('[SecureStorage] Failed to remove item:', createSafeError(error, 'removeItem'))
      return false
    }
  }

  /**
   * Clears all items with a specific prefix
   */
  clearWithPrefix(prefix: string): number {
    let count = 0
    try {
      const storage = this.getStorage()
      if (!storage) return 0

      if (storage instanceof Map) {
        const keysToDelete: string[] = []
        storage.forEach((_, key) => {
          if (key.startsWith(prefix)) {
            keysToDelete.push(key)
          }
        })
        keysToDelete.forEach(key => {
          storage.delete(key)
          count++
        })
      } else {
        const keys = Object.keys(storage)
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            storage.removeItem(key)
            count++
          }
        })
      }
    } catch (error) {
      console.error('[SecureStorage] Failed to clear with prefix:', createSafeError(error, 'clearWithPrefix'))
    }
    return count
  }

  /**
   * Clears all storage
   */
  clear(): boolean {
    try {
      const storage = this.getStorage()
      if (!storage) return false

      if (storage instanceof Map) {
        storage.clear()
      } else {
        storage.clear()
      }

      return true
    } catch (error) {
      console.error('[SecureStorage] Failed to clear:', createSafeError(error, 'clear'))
      return false
    }
  }
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

/**
 * Revokes object URLs to prevent memory leaks
 */
export function revokeObjectURLs(urls: string[]): void {
  urls.forEach(url => {
    try {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      // Silently fail - URL might already be revoked
    }
  })
}

/**
 * Creates a cleanup manager for tracking and cleaning up resources
 */
export class CleanupManager {
  private cleanupFunctions: Array<() => void> = []
  private objectUrls: Set<string> = new Set()

  /**
   * Registers a cleanup function
   */
  register(fn: () => void): void {
    this.cleanupFunctions.push(fn)
  }

  /**
   * Tracks an object URL for cleanup
   */
  trackObjectURL(url: string): void {
    if (url && url.startsWith('blob:')) {
      this.objectUrls.add(url)
    }
  }

  /**
   * Executes all cleanup functions
   */
  cleanup(): void {
    // Revoke object URLs
    this.objectUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url)
      } catch {
        // Ignore errors
      }
    })
    this.objectUrls.clear()

    // Execute cleanup functions
    this.cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('[CleanupManager] Cleanup function failed:', error)
      }
    })
    this.cleanupFunctions = []
  }

  /**
   * Resets the cleanup manager
   */
  reset(): void {
    this.cleanup()
  }
}

// ============================================================================
// FETCH UTILITIES WITH TIMEOUT & ABORT
// ============================================================================

export interface SecureFetchOptions extends RequestInit {
  timeout?: number // Timeout in milliseconds
  retries?: number // Number of retry attempts
  retryDelay?: number // Delay between retries in milliseconds
}

/**
 * Enhanced fetch with automatic timeout, abort controller, and retry logic
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const {
    timeout = 15000, // 15 second default timeout
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error instanceof Error ? error : new Error('Unknown fetch error')

      // Don't retry on abort (user cancelled)
      if (lastError.name === 'AbortError' && !controller.signal.aborted) {
        // Timeout occurred
        lastError = new Error('Request timeout')
        lastError.name = 'TimeoutError'
      }

      // Don't retry if this was the last attempt
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries')
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Simple rate limiter to prevent API abuse
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Checks if a request is allowed for the given key
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  /**
   * Gets the time until the next request is allowed (in ms)
   */
  getTimeUntilNextRequest(key: string): number {
    const requests = this.requests.get(key) ?? []
    if (requests.length < this.maxRequests) return 0

    const oldestRequest = requests[0]
    if (oldestRequest === undefined) return 0

    const timeElapsed = Date.now() - oldestRequest
    return Math.max(0, this.windowMs - timeElapsed)
  }

  /**
   * Resets the rate limiter for a specific key
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clears all rate limit data
   */
  clear(): void {
    this.requests.clear()
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create default instances for convenience
export const defaultStorage = new SecureStorage('memory')
export const defaultRateLimiter = new RateLimiter()

// Storage keys (centralized to avoid typos and enable easy cleanup)
export const STORAGE_KEYS = {
  DRAFT_REPORT: 'reporta:draft',
  USER_PREFERENCES: 'reporta:preferences',
  LAST_LOCATION: 'reporta:lastLocation',
  SESSION_ID: 'reporta:sessionId',
} as const
