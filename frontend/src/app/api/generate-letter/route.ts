import { NextRequest, NextResponse } from 'next/server'

// Tipo para os dados do reporte
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

// Funcao para gerar carta sem IA (fallback simples)
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

  const senderName = data.isAnonymous ? 'Cidadão de Viseu' : (data.name || 'Cidadão de Viseu')

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

// Funcao para chamar a API do Google Gemini
async function generateWithGemini(data: ReportData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  // Se não houver chave API configurada, usar fallback local
  if (!apiKey) {
    console.warn('GEMINI_API_KEY não configurada - usando geração local')
    return generateLocalLetter(data)
  }

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

  const senderName = data.isAnonymous ? 'Cidadão de Viseu' : (data.name || 'Cidadão de Viseu')

  const prompt = `TAREFA: Reescreve COMPLETAMENTE esta descrição informal numa versão formal e profissional para uma carta oficial à Câmara Municipal.

TEXTO ORIGINAL DO CIDADÃO: "${data.description || 'Problema que necessita atenção'}"
TIPO DE PROBLEMA: ${data.category?.label || 'Geral'}

INSTRUÇÕES OBRIGATÓRIAS:
1. NÃO copies o texto original - REESCREVE tudo em linguagem formal
2. EXPANDE sempre - mesmo textos longos devem ser melhorados
3. Adiciona contexto sobre impacto na comunidade (segurança, higiene, qualidade de vida)
4. Usa vocabulário técnico e institucional apropriado
5. Estrutura em 3-4 frases bem construídas
6. USA SEMPRE acentos corretos em Português (situação, intervenção, públic, etc.)

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

EXEMPLOS DE TRANSFORMAÇÃO:
INPUT: "há um buraco grande"
OUTPUT: "Foi identificada uma degradação significativa no pavimento, apresentando uma cavidade de dimensões consideráveis que constitui sério risco para a circulação de veículos e peões. Esta situação requer intervenção urgente para prevenir acidentes e garantir a segurança dos cidadãos."

INPUT: "luz da rua não funciona há semanas"
OUTPUT: "Constata-se que o sistema de iluminação pública nesta artéria se encontra inoperacional há várias semanas. A ausência de iluminação adequada compromete significativamente a segurança dos residentes e transeuntes, especialmente durante o período noturno, criando condições propícias a ocorrências indesejáveis."

INPUT: "muito lixo aqui"
OUTPUT: "Verifica-se a acumulação excessiva de resíduos sólidos neste local, situação que afeta negativamente as condições de salubridade e a qualidade de vida dos residentes. A presença prolongada destes detritos constitui um foco de insalubridade e prejudica a imagem urbana da zona."

REGRAS:
- USA SEMPRE acentos corretos em Português (é obrigatório!)
- NÃO incluas saudações, despedidas ou assinaturas
- Escreve APENAS o parágrafo formal (3-4 frases)

PARÁGRAFO FORMAL:`

  try {
    console.log('Chamando Gemini API com descricao:', data.description)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    )

    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na API Gemini:', response.status, errorText)
      return generateLocalLetter(data)
    }

    const result = await response.json()
    console.log('Gemini result:', JSON.stringify(result).substring(0, 500))

    // Extrair o texto da resposta do Gemini
    let formalDescription = ''
    if (
      result.candidates &&
      result.candidates[0] &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts[0]
    ) {
      formalDescription = result.candidates[0].content.parts[0].text.trim()
      console.log('Descricao formal gerada:', formalDescription.substring(0, 200))
    } else {
      console.log('Resposta Gemini inesperada:', JSON.stringify(result))
      return generateLocalLetter(data)
    }

    // Construir a carta completa com o paragrafo gerado
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
    console.error('Erro ao chamar API Gemini:', error)
    return generateLocalLetter(data)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ReportData = await request.json()

    // Validar dados mínimos
    if (!data.category || !data.location) {
      return NextResponse.json(
        { error: 'Dados incompletos. Categoria e localização são obrigatórios.' },
        { status: 400 }
      )
    }

    // Gerar carta com Gemini AI
    const letter = await generateWithGemini(data)

    return NextResponse.json({
      success: true,
      letter,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao gerar carta:', error)
    return NextResponse.json(
      { error: 'Erro interno ao gerar carta' },
      { status: 500 }
    )
  }
}
