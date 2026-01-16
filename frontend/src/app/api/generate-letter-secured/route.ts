import { NextRequest, NextResponse } from 'next/server'
import { validateReportData, validationErrorResponse } from '@/lib/api-validation'
import { getEnvVar, isEnvConfigured } from '@/lib/env-validation'

// Set max duration for API route (in seconds)
export const maxDuration = 30

// Runtime configuration
export const runtime = 'nodejs'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ReportData {
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

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GEMINI_CONFIG = {
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  TIMEOUT: 15000, // 15 seconds
  MAX_RETRIES: 2,
  GENERATION_CONFIG: {
    temperature: 0.7,
    maxOutputTokens: 2000,
    topP: 0.95,
    topK: 40,
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate letter locally without AI (fallback)
 */
function generateLocalLetter(data: ReportData): string {
  const today = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const urgencyText = {
    baixa: 'quando possível',
    media: 'com brevidade',
    alta: 'com urgência',
  }

  const userDescription = data.description?.trim() || 'Situação que necessita de atenção.'
  const formalDescription = userDescription.charAt(0).toUpperCase() + userDescription.slice(1)
  const finalDescription = /[.!?]$/.test(formalDescription) ? formalDescription : formalDescription + '.'

  const senderName = data.isAnonymous ? 'Cidadão de Viseu' : data.name || 'Cidadão de Viseu'

  const contactBlock = data.isAnonymous
    ? ''
    : `
Contacto: ${data.name || ''}${data.email ? ` | ${data.email}` : ''}${data.phone ? ` | ${data.phone}` : ''}`

  return `Viseu, ${today}

Exmo. Sr. Presidente da Câmara Municipal de Viseu

Assunto: ${data.category?.label || 'Ocorrência'} - ${data.location?.address || 'Viseu'}

Venho por este meio comunicar a seguinte situação:

${finalDescription}

Local: ${data.location?.address || 'Ver coordenadas'}
${data.location?.freguesia ? `Freguesia: ${data.location.freguesia}` : ''}
Coordenadas: ${data.location?.lat?.toFixed(6) || 'N/A'}, ${data.location?.lng?.toFixed(6) || 'N/A'}

Solicito intervenção ${urgencyText[data.urgency]}.

Com os melhores cumprimentos,
${senderName}
${contactBlock}`
}

/**
 * Generate letter using Google Gemini AI (with security improvements)
 */
async function generateWithGemini(data: ReportData): Promise<string> {
  // Check environment configuration
  if (!isEnvConfigured()) {
    console.warn('⚠️  Environment not properly configured - using local generation')
    return generateLocalLetter(data)
  }

  const apiKey = getEnvVar('GEMINI_API_KEY')

  const today = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const urgencyText = {
    baixa: 'quando possível',
    media: 'com brevidade',
    alta: 'com urgência',
  }

  const senderName = data.isAnonymous ? 'Cidadão de Viseu' : data.name || 'Cidadão de Viseu'

  const prompt = `TAREFA: Reescreve COMPLETAMENTE esta descrição informal numa versão formal e profissional para uma carta oficial à Câmara Municipal.

TEXTO ORIGINAL DO CIDADÃO: "${data.description || 'Problema que necessita atenção'}"
TIPO DE PROBLEMA: ${data.category?.label || 'Geral'}

INSTRUÇÕES OBRIGATÓRIAS:
1. NÃO copies o texto original - REESCREVE tudo em linguagem formal
2. EXPANDE sempre - mesmo textos longos devem ser melhorados
3. Adiciona contexto sobre impacto na comunidade (segurança, higiene, qualidade de vida)
4. Usa vocabulário técnico e institucional apropriado
5. Estrutura em 3-4 frases bem construídas
6. USA SEMPRE acentos corretos em Português (situação, intervenção, público, etc.)

TRANSFORMAÇÕES OBRIGATÓRIAS:
- "buraco" → "cavidade/degradação no pavimento"
- "luz" → "iluminação pública"
- "lixo" → "resíduos/detritos"
- "barulho" → "poluição sonora"
- "água" → "fuga de água/alagamento"
- "árvore" → "espécie arbórea/vegetação"
- "carro" → "veículo/viatura"
- "estragado/partido" → "danificado/inoperacional"
- "perigoso" → "constitui risco para a segurança pública"

REGRAS:
- USA SEMPRE acentos corretos em Português (é obrigatório!)
- NÃO incluas saudações, despedidas ou assinaturas
- Escreve APENAS o parágrafo formal (3-4 frases)

PARÁGRAFO FORMAL:`

  try {
    // Create abort controller with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT)

    // SECURITY: Use Authorization header instead of query parameter
    // This prevents API key from being logged in server logs
    const response = await fetch(GEMINI_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey, // Google's recommended header
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: GEMINI_CONFIG.GENERATION_CONFIG,
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Don't log full response in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Gemini response status:', response.status)
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('❌ Gemini API error:', response.status, errorText.substring(0, 200))
      return generateLocalLetter(data)
    }

    const result: GeminiResponse = await response.json()

    // Extract formal description from response
    let formalDescription = ''
    if (
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0]
    ) {
      formalDescription = result.candidates[0].content.parts[0].text?.trim() || ''
    } else {
      console.warn('⚠️  Unexpected Gemini response structure')
      return generateLocalLetter(data)
    }

    // Validate generated content (prevent injection)
    if (formalDescription.length < 50 || formalDescription.length > 5000) {
      console.warn('⚠️  Generated content has suspicious length')
      return generateLocalLetter(data)
    }

    // Build complete letter with generated paragraph
    const contactBlock = data.isAnonymous
      ? ''
      : `
Contacto: ${data.name || ''}${data.email ? ` | ${data.email}` : ''}${data.phone ? ` | ${data.phone}` : ''}`

    return `Viseu, ${today}

Exmo. Sr. Presidente da Câmara Municipal de Viseu

Assunto: ${data.category?.label || 'Ocorrência'} - ${data.location?.address || 'Viseu'}

Venho por este meio comunicar a seguinte situação:

${formalDescription}

Local: ${data.location?.address || 'Ver coordenadas'}
${data.location?.freguesia ? `Freguesia: ${data.location.freguesia}` : ''}
Coordenadas: ${data.location?.lat?.toFixed(6) || 'N/A'}, ${data.location?.lng?.toFixed(6) || 'N/A'}

Solicito intervenção ${urgencyText[data.urgency]}.

Com os melhores cumprimentos,
${senderName}
${contactBlock}`
  } catch (error) {
    // Don't log full error in production (may contain sensitive info)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Gemini API timeout')
      } else {
        console.error('❌ Gemini API error:', error.message)
      }
    } else {
      console.error('❌ Unknown error calling Gemini API')
    }

    return generateLocalLetter(data)
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Step 1: Parse and validate input
    const body = await request.json()
    const validationResult = validateReportData(body)

    if (!validationResult.valid) {
      return validationErrorResponse(validationResult.errors || ['Invalid input'])
    }

    const data = validationResult.data as ReportData

    // Step 2: Additional business logic validation
    if (!data.category || !data.location) {
      return NextResponse.json(
        { error: 'Dados incompletos. Categoria e localização são obrigatórios.' },
        { status: 400 }
      )
    }

    // Step 3: Generate letter with AI
    const letter = await generateWithGemini(data)

    // Step 4: Validate generated letter
    if (!letter || letter.length < 100) {
      throw new Error('Generated letter is too short or empty')
    }

    // Log success (without sensitive data)
    const duration = Date.now() - startTime
    console.log(
      `✅ Letter generated successfully in ${duration}ms (category: ${data.category.id}, anonymous: ${data.isAnonymous})`
    )

    // Step 5: Return response
    return NextResponse.json(
      {
        success: true,
        letter,
        generatedAt: new Date().toISOString(),
        metadata: {
          category: data.category.label,
          urgency: data.urgency,
          isAnonymous: data.isAnonymous,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    // Log error securely (without exposing sensitive information)
    const duration = Date.now() - startTime
    console.error(`❌ Error generating letter after ${duration}ms:`, error instanceof Error ? error.message : 'Unknown error')

    // Return generic error to client
    return NextResponse.json(
      {
        error: 'Erro interno ao gerar carta',
        message: 'Não foi possível processar o seu pedido. Por favor, tente novamente.',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// Disable other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
