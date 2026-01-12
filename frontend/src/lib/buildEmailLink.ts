import { ReportData } from '@/types'
import { URGENCY_LABELS } from './constants'

export function buildEmailLink(data: ReportData): string {
  if (!data.category || !data.location) return '#'

  const subject = `[${data.reference}] ${data.category.label} - Reporta Viseu`

  const body = `
REPORTA VISEU - REPORTE DE PROBLEMA
═══════════════════════════════════════════════════════

REFERÊNCIA: ${data.reference}

CATEGORIA
─────────────────────────────────────────────────────
Tipo: ${data.category.label}
Descrição Breve: ${data.category.sublabel}
Departamento: ${data.category.departamento}

LOCALIZAÇÃO
─────────────────────────────────────────────────────
Coordenadas: ${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}
Morada: ${data.location.address || 'Não disponível'}
Freguesia: ${data.location.freguesia || 'Não especificada'}

DESCRIÇÃO DO PROBLEMA
─────────────────────────────────────────────────────
${data.description || 'Sem descrição'}

URGÊNCIA
─────────────────────────────────────────────────────
Nível: ${URGENCY_LABELS[data.urgency]}

${data.photos.length > 0 ? `FOTOGRAFIAS\n─────────────────────────────────────────────────────\n${data.photos.length} fotografia(s) anexada(s)\n\n` : ''}${!data.isAnonymous ? `DADOS DE CONTACTO\n─────────────────────────────────────────────────────\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}\n\n` : 'REPORTE ANÓNIMO\n─────────────────────────────────────────────────────\nO cidadão optou por reportar anonimamente.\n\n'}
DATA DE REPORTE
─────────────────────────────────────────────────────
${new Date().toLocaleString('pt-PT', {
  dateStyle: 'full',
  timeStyle: 'short',
})}

═══════════════════════════════════════════════════════
Enviado através de Reporta Viseu
Aplicação desenvolvida para a Câmara Municipal de Viseu
  `.trim()

  const mailto = `mailto:${data.category.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return mailto
}

export function buildEmailBody(data: ReportData): string {
  if (!data.category || !data.location) return ''

  return `
REPORTA VISEU - REPORTE DE PROBLEMA
═══════════════════════════════════════════════════════

REFERÊNCIA: ${data.reference}

CATEGORIA
─────────────────────────────────────────────────────
Tipo: ${data.category.label}
Descrição Breve: ${data.category.sublabel}
Departamento: ${data.category.departamento}

LOCALIZAÇÃO
─────────────────────────────────────────────────────
Coordenadas: ${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}
Morada: ${data.location.address || 'Não disponível'}
Freguesia: ${data.location.freguesia || 'Não especificada'}

DESCRIÇÃO DO PROBLEMA
─────────────────────────────────────────────────────
${data.description || 'Sem descrição'}

URGÊNCIA
─────────────────────────────────────────────────────
Nível: ${URGENCY_LABELS[data.urgency]}

${data.photos.length > 0 ? `FOTOGRAFIAS\n─────────────────────────────────────────────────────\n${data.photos.length} fotografia(s) anexada(s)\n\n` : ''}${!data.isAnonymous ? `DADOS DE CONTACTO\n─────────────────────────────────────────────────────\nNome: ${data.name}\nEmail: ${data.email}\nTelefone: ${data.phone}\n\n` : 'REPORTE ANÓNIMO\n─────────────────────────────────────────────────────\nO cidadão optou por reportar anonimamente.\n\n'}
DATA DE REPORTE
─────────────────────────────────────────────────────
${new Date().toLocaleString('pt-PT', {
  dateStyle: 'full',
  timeStyle: 'short',
})}

═══════════════════════════════════════════════════════
Enviado através de Reporta Viseu
Aplicação desenvolvida para a Câmara Municipal de Viseu
  `.trim()
}
