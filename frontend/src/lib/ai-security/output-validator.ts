/**
 * Output Validation for AI-Generated Content
 *
 * Ensures AI-generated responses are:
 * - Safe and appropriate
 * - Properly formatted
 * - Free from malicious content
 * - Within expected parameters
 */

interface ValidationResult {
  isValid: boolean
  sanitizedOutput: string
  errors: string[]
  warnings: string[]
  metadata: {
    originalLength: number
    sanitizedLength: number
    toxicityScore: number
    flaggedPatterns: string[]
  }
}

/**
 * Patterns that should not appear in formal letters
 */
const INAPPROPRIATE_PATTERNS = [
  // Profanity or offensive language (Portuguese)
  /\b(merda|caralho|puta|foda|cu|porra|idiota|estúpido)\b/gi,

  // Discriminatory language
  /\b(preto|negro|cigano|gay|bicha|paneleiro)\b.*\b(sujo|inferior|mau)\b/gi,

  // Threats or violence
  /\b(matar|destruir|atacar|violência|ameaça|bomba)\b/gi,

  // Spam indicators
  /click\s+here|clique\s+aqui/gi,
  /viagra|casino|lottery|lotaria/gi,

  // Code injection attempts in output
  /<script\b/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,

  // Unusual characters that might break rendering
  /[\u202E\u202D]/g, // Right-to-left override
]

/**
 * Required structure for a formal letter
 */
const LETTER_STRUCTURE_REQUIREMENTS = {
  mustContain: [
    'Viseu',
    'Exmo.',
    'Presidente',
    'Câmara Municipal',
  ],
  shouldNotContain: [
    'AI',
    'GPT',
    'Gemini',
    'modelo de linguagem',
    'inteligência artificial',
    'como modelo',
    'desculpe',
    'não posso',
  ],
}

/**
 * Validate AI-generated output
 */
export function validateOutput(
  output: string,
  options: {
    maxLength?: number
    minLength?: number
    strictMode?: boolean
    checkStructure?: boolean
  } = {}
): ValidationResult {
  const {
    maxLength = 5000,
    minLength = 100,
    strictMode = false,
    checkStructure = true,
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  const flaggedPatterns: string[] = []
  let sanitized = output
  const originalLength = output.length
  let toxicityScore = 0

  // 1. Basic validation
  if (!output || typeof output !== 'string') {
    return {
      isValid: false,
      sanitizedOutput: '',
      errors: ['Output must be a non-empty string'],
      warnings: [],
      metadata: {
        originalLength: 0,
        sanitizedLength: 0,
        toxicityScore: 0,
        flaggedPatterns: [],
      },
    }
  }

  // 2. Length validation
  if (output.length < minLength) {
    errors.push(`Output too short (minimum ${minLength} characters)`)
  }

  if (output.length > maxLength) {
    warnings.push(`Output exceeds recommended length of ${maxLength} characters`)
    if (strictMode) {
      sanitized = sanitized.substring(0, maxLength)
    }
  }

  // 3. Check for inappropriate content
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      toxicityScore += matches.length * 10
      flaggedPatterns.push(pattern.source)
      errors.push('Inappropriate content detected in output')

      if (strictMode) {
        // Block the entire output
        return {
          isValid: false,
          sanitizedOutput: '',
          errors,
          warnings,
          metadata: {
            originalLength,
            sanitizedLength: 0,
            toxicityScore,
            flaggedPatterns,
          },
        }
      }

      // Remove inappropriate content
      sanitized = sanitized.replace(pattern, '[REMOVIDO]')
    }
  }

  // 4. Check letter structure (if applicable)
  if (checkStructure) {
    // Check for required elements
    for (const required of LETTER_STRUCTURE_REQUIREMENTS.mustContain) {
      if (!sanitized.includes(required)) {
        errors.push(`Missing required element: ${required}`)
      }
    }

    // Check for elements that shouldn't be there
    for (const forbidden of LETTER_STRUCTURE_REQUIREMENTS.shouldNotContain) {
      if (sanitized.toLowerCase().includes(forbidden.toLowerCase())) {
        warnings.push(`Output contains unexpected element: ${forbidden}`)
        flaggedPatterns.push(forbidden)
        toxicityScore += 5

        if (strictMode) {
          // Remove references to AI/LLM
          const regex = new RegExp(forbidden, 'gi')
          sanitized = sanitized.replace(regex, '')
        }
      }
    }
  }

  // 5. Check for excessive repetition (sign of model malfunction)
  const repetitionScore = checkRepetition(sanitized)
  if (repetitionScore > 0.3) {
    errors.push('Output contains excessive repetition')
    toxicityScore += 20
  }

  // 6. Validate Portuguese language integrity
  if (!isValidPortuguese(sanitized)) {
    warnings.push('Output may contain language errors')
    toxicityScore += 5
  }

  // 7. Check for truncated output (incomplete responses)
  if (isTruncated(sanitized)) {
    errors.push('Output appears to be truncated or incomplete')
    toxicityScore += 15
  }

  // 8. Remove potential XSS vectors
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  // 9. Normalize whitespace and formatting
  sanitized = sanitized
    .replace(/\n{4,}/g, '\n\n\n') // Max 3 consecutive newlines
    .replace(/\s+$/gm, '') // Remove trailing spaces from lines
    .trim()

  // 10. Final sanity check - ensure minimum quality
  if (sanitized.length < 50) {
    errors.push('Sanitized output too short to be valid')
  }

  const isValid = errors.length === 0 && toxicityScore < 30

  return {
    isValid,
    sanitizedOutput: sanitized,
    errors,
    warnings,
    metadata: {
      originalLength,
      sanitizedLength: sanitized.length,
      toxicityScore,
      flaggedPatterns,
    },
  }
}

/**
 * Check for excessive repetition in text
 */
function checkRepetition(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  if (words.length < 10) return 0

  const wordCounts = new Map<string, number>()
  let maxCount = 0

  for (const word of words) {
    if (word.length < 3) continue // Skip short words
    const count = (wordCounts.get(word) || 0) + 1
    wordCounts.set(word, count)
    maxCount = Math.max(maxCount, count)
  }

  // Return ratio of most repeated word to total words
  return maxCount / words.length
}

/**
 * Basic Portuguese language validation
 */
function isValidPortuguese(text: string): boolean {
  // Check for reasonable balance of vowels and consonants
  const vowels = text.match(/[aeiouáéíóúâêôãõ]/gi) || []
  const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []

  if (vowels.length === 0 || consonants.length === 0) return false

  const vowelRatio = vowels.length / (vowels.length + consonants.length)

  // Portuguese typically has 40-50% vowels
  return vowelRatio >= 0.3 && vowelRatio <= 0.6
}

/**
 * Check if output appears truncated
 */
function isTruncated(text: string): boolean {
  const lastChars = text.slice(-10).trim()

  // Check if it ends mid-sentence
  if (!/[.!?]$/.test(lastChars)) {
    // Exception: if it ends with a complete word and reasonable length
    if (text.length > 200 && /\b\w+\s*$/.test(lastChars)) {
      return false
    }
    return true
  }

  // Check for incomplete common phrases
  const incompletePatterns = [
    /\bcom\s+os\s+melhores\s*$/i,
    /\bsolicito\s*$/i,
    /\bvenho\s+por\s*$/i,
    /\batenciosamente\s*$/i,
  ]

  for (const pattern of incompletePatterns) {
    if (pattern.test(text)) {
      return true
    }
  }

  return false
}

/**
 * Validate specific aspects of a formal letter
 */
export function validateLetter(letter: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check date format
  if (!/Viseu,\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/i.test(letter)) {
    issues.push('Invalid or missing date format')
  }

  // Check recipient
  if (!letter.includes('Exmo.') || !letter.includes('Presidente')) {
    issues.push('Invalid or missing recipient')
  }

  // Check subject line
  if (!letter.includes('Assunto:')) {
    issues.push('Missing subject line')
  }

  // Check closing
  if (!letter.includes('cumprimentos')) {
    issues.push('Missing proper closing')
  }

  // Check for coordinates
  if (!/Coordenadas:?\s*-?\d+\.\d+,\s*-?\d+\.\d+/i.test(letter)) {
    issues.push('Missing or invalid coordinates')
  }

  // Check minimum length for each section
  const sections = letter.split('\n\n')
  if (sections.length < 3) {
    issues.push('Letter structure appears incomplete')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

/**
 * Sanitize output for safe display in HTML
 */
export function sanitizeForDisplay(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export type { ValidationResult }
