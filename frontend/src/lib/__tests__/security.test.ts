/**
 * Security Utilities Test Suite
 *
 * Run with: npm test or jest
 */

import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidCoordinate,
  sanitizeFileName,
  redactEmail,
  redactPhone,
  redactName,
  createSafeLogData,
  createSafeError,
  SecureStorage,
  RateLimiter,
  revokeObjectURLs,
} from '../security'

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      expect(sanitizeInput('text onclick=alert("xss")')).toBe('text alert("xss")')
    })

    it('should preserve normal text', () => {
      expect(sanitizeInput('Normal text with numbers 123')).toBe('Normal text with numbers 123')
    })

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate Portuguese phone numbers', () => {
      expect(isValidPhone('912345678')).toBe(true)
      expect(isValidPhone('+351912345678')).toBe(true)
      expect(isValidPhone('+351 912345678')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('12345')).toBe(false)
      expect(isValidPhone('abc123456')).toBe(false)
      expect(isValidPhone('+1234567890')).toBe(false)
    })
  })

  describe('isValidCoordinate', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinate(40.6610, -7.9097)).toBe(true)
      expect(isValidCoordinate(0, 0)).toBe(true)
      expect(isValidCoordinate(-90, -180)).toBe(true)
      expect(isValidCoordinate(90, 180)).toBe(true)
    })

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinate(91, 0)).toBe(false)
      expect(isValidCoordinate(0, 181)).toBe(false)
      expect(isValidCoordinate(NaN, 0)).toBe(false)
      expect(isValidCoordinate(0, NaN)).toBe(false)
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove special characters', () => {
      expect(sanitizeFileName('file<name>.jpg')).toBe('file_name_.jpg')
    })

    it('should prevent directory traversal', () => {
      expect(sanitizeFileName('../../../etc/passwd')).toBe('_.._.._.._etc_passwd')
    })

    it('should limit length', () => {
      const longName = 'a'.repeat(300)
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255)
    })
  })
})

describe('PII Redaction', () => {
  describe('redactEmail', () => {
    it('should redact email addresses', () => {
      expect(redactEmail('john.doe@example.com')).toBe('j***@e***.com')
      expect(redactEmail('user@domain.co.uk')).toBe('u***@d***.uk')
    })

    it('should handle invalid emails', () => {
      expect(redactEmail('')).toBe('[REDACTED]')
      expect(redactEmail('invalid')).toBe('[REDACTED]')
    })
  })

  describe('redactPhone', () => {
    it('should redact phone numbers', () => {
      expect(redactPhone('912345678')).toBe('91***5678')
      expect(redactPhone('+351912345678')).toBe('35***5678')
    })

    it('should handle short numbers', () => {
      expect(redactPhone('123')).toBe('***')
    })
  })

  describe('redactName', () => {
    it('should redact names', () => {
      expect(redactName('João Silva')).toBe('J*** S***')
      expect(redactName('Maria')).toBe('M***')
    })

    it('should handle empty names', () => {
      expect(redactName('')).toBe('[REDACTED]')
    })
  })

  describe('createSafeLogData', () => {
    it('should create safe log data', () => {
      const data = {
        location: { lat: 40.6610789, lng: -7.9097123, address: 'Test Address' },
        category: { id: 'test', label: 'Test Category' },
        description: 'Long description here',
        photos: [{}, {}, {}],
        urgency: 'urgente',
        isAnonymous: false,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '912345678',
      }

      const safe = createSafeLogData(data)

      expect(safe.location.lat).toBe(40.661)
      expect(safe.location.lng).toBe(-7.910)
      expect(safe.location.hasAddress).toBe(true)
      expect(safe.descriptionLength).toBe(21)
      expect(safe.photoCount).toBe(3)
      expect(safe.name).toBe('J*** D***')
      expect(safe.email).toBe('j***@e***.com')
      expect(safe.phone).toBe('91***5678')
    })

    it('should handle anonymous data', () => {
      const data = {
        isAnonymous: true,
        name: 'John Doe',
        email: 'john@example.com',
      }

      const safe = createSafeLogData(data)

      expect(safe.name).toBeUndefined()
      expect(safe.email).toBeUndefined()
    })
  })
})

describe('Error Handling', () => {
  describe('createSafeError', () => {
    it('should create safe error from Error object', () => {
      const error = new Error('Internal error message')
      const safe = createSafeError(error)

      expect(safe.message).toBe('Ocorreu um erro inesperado. Por favor, tente novamente.')
      expect(safe.code).toBe('UNKNOWN_ERROR')
      expect(safe.timestamp).toBeDefined()
    })

    it('should map AbortError', () => {
      const error = new Error('Operation aborted')
      error.name = 'AbortError'
      const safe = createSafeError(error)

      expect(safe.code).toBe('OPERATION_CANCELLED')
    })

    it('should map NetworkError', () => {
      const error = new Error('fetch failed')
      const safe = createSafeError(error)

      expect(safe.code).toBe('FETCH_ERROR')
    })
  })
})

describe('SecureStorage', () => {
  let storage: SecureStorage

  beforeEach(() => {
    storage = new SecureStorage('memory')
  })

  afterEach(() => {
    storage.clear()
  })

  it('should store and retrieve data', () => {
    const data = { test: 'value' }
    storage.setItem('key', data)
    const retrieved = storage.getItem('key')

    expect(retrieved).toEqual(data)
  })

  it('should store and retrieve obfuscated data', () => {
    const data = { sensitive: 'data' }
    storage.setItem('key', data, true)
    const retrieved = storage.getItem('key', true)

    expect(retrieved).toEqual(data)
  })

  it('should remove items', () => {
    storage.setItem('key', 'value')
    storage.removeItem('key')
    const retrieved = storage.getItem('key')

    expect(retrieved).toBeNull()
  })

  it('should clear items with prefix', () => {
    storage.setItem('app:key1', 'value1')
    storage.setItem('app:key2', 'value2')
    storage.setItem('other:key', 'value3')

    const count = storage.clearWithPrefix('app:')

    expect(count).toBe(2)
    expect(storage.getItem('app:key1')).toBeNull()
    expect(storage.getItem('other:key')).toBe('value3')
  })

  it('should clear all storage', () => {
    storage.setItem('key1', 'value1')
    storage.setItem('key2', 'value2')
    storage.clear()

    expect(storage.getItem('key1')).toBeNull()
    expect(storage.getItem('key2')).toBeNull()
  })
})

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter(3, 1000) // 3 requests per second
  })

  afterEach(() => {
    limiter.clear()
  })

  it('should allow requests under limit', () => {
    expect(limiter.isAllowed('user1')).toBe(true)
    expect(limiter.isAllowed('user1')).toBe(true)
    expect(limiter.isAllowed('user1')).toBe(true)
  })

  it('should block requests over limit', () => {
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')

    expect(limiter.isAllowed('user1')).toBe(false)
  })

  it('should track different users separately', () => {
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')

    expect(limiter.isAllowed('user2')).toBe(true)
  })

  it('should calculate time until next request', () => {
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')

    const timeUntil = limiter.getTimeUntilNextRequest('user1')
    expect(timeUntil).toBeGreaterThan(0)
    expect(timeUntil).toBeLessThanOrEqual(1000)
  })

  it('should reset rate limit for user', () => {
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')
    limiter.isAllowed('user1')

    limiter.reset('user1')

    expect(limiter.isAllowed('user1')).toBe(true)
  })
})

describe('Memory Management', () => {
  describe('revokeObjectURLs', () => {
    it('should handle empty array', () => {
      expect(() => revokeObjectURLs([])).not.toThrow()
    })

    it('should handle invalid URLs gracefully', () => {
      expect(() => revokeObjectURLs(['invalid', 'blob:invalid'])).not.toThrow()
    })

    it('should only process blob URLs', () => {
      const urls = [
        'blob:http://localhost:3000/abc123',
        'http://example.com/image.jpg',
        'data:image/png;base64,abc',
      ]

      expect(() => revokeObjectURLs(urls)).not.toThrow()
    })
  })
})
