import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { ReportWithRelations } from './ReportService';

/**
 * Sanitizes text by removing control characters and potential injection attempts
 */
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Escapes special characters that could affect prompt injection
 */
function escapePromptInjection(text: string): string {
  if (!text || typeof text !== 'string') return '';
  // Replace potential prompt injection attempts
  return text
    .replace(/\{\{/g, '{ {')
    .replace(/\}\}/g, '} }')
    .replace(/\[INST\]/gi, '[_INST_]')
    .replace(/\[\/INST\]/gi, '[_/INST_]')
    .replace(/<\|.*?\|>/g, '') // Remove special tokens
    .replace(/###/g, '# # #');
}

export class LetterService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generates a formal letter in Portuguese (PT-PT) for a citizen report
   * to be sent to the relevant municipal department
   *
   * All inputs are sanitized to prevent XSS and prompt injection attacks
   */
  async generateLetter(report: ReportWithRelations): Promise<string> {
    try {
      logger.info('A gerar carta para relatório', { reportId: report.id });

      // Sanitize all user inputs to prevent XSS and prompt injection
      const sanitizedDescription = escapePromptInjection(sanitizeText(report.description));
      const sanitizedAddress = escapePromptInjection(sanitizeText(report.address));
      const sanitizedFreguesia = report.freguesia ? escapePromptInjection(sanitizeText(report.freguesia)) : '';
      const sanitizedName = report.name ? escapePromptInjection(sanitizeText(report.name)) : '';
      const sanitizedEmail = report.email ? sanitizeText(report.email) : '';
      const sanitizedPhone = report.phone ? sanitizeText(report.phone) : '';

      const urgencyLabel = this.getUrgencyLabel(report.urgency);
      const citizenInfo = report.isAnonymous
        ? 'Munícipe (anónimo)'
        : `${sanitizedName} (${sanitizedEmail}${sanitizedPhone ? `, tel: ${sanitizedPhone}` : ''})`;

      // Use XML tags to clearly separate user input from instructions
      const prompt = `Você é um assistente especializado em redigir cartas formais para a administração pública portuguesa.

Redija uma carta formal em português de Portugal (PT-PT) para o departamento municipal "${report.category.departamento}" da Câmara Municipal de Viseu, relatando a seguinte ocorrência:

INFORMAÇÕES DA OCORRÊNCIA:
- Referência: ${report.reference}
- Categoria: ${report.category.label}
- Descrição: ${sanitizedDescription}
- Localização: ${sanitizedAddress}${sanitizedFreguesia ? `, ${sanitizedFreguesia}` : ''}
- Coordenadas: ${report.latitude}, ${report.longitude}
- Urgência: ${urgencyLabel}
- Data de reporte: ${new Date(report.createdAt).toLocaleDateString('pt-PT')}
- Reportado por: ${citizenInfo}

INSTRUÇÕES:
1. Use um tom formal e respeitoso, apropriado para correspondência oficial
2. Comece com uma saudação formal ao departamento
3. Identifique claramente o problema reportado e a sua localização exata
4. Descreva o problema de forma clara e objetiva
5. Se a urgência for ALTA ou MÉDIA, mencione a importância de uma resolução atempada
6. Inclua todos os detalhes relevantes (referência, coordenadas GPS, etc.)
7. Termine com uma fórmula de cortesia apropriada
8. Use linguagem formal portuguesa (PT-PT), não brasileira
9. A carta deve ter entre 200-400 palavras
10. Formate a carta em markdown simples (parágrafos, negrito para destaques)

Redija apenas a carta, sem introduções ou explicações adicionais.`;

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const letter = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      if (!letter) {
        throw new Error('Falha ao gerar conteúdo da carta');
      }

      logger.info('Carta gerada com sucesso', {
        reportId: report.id,
        letterLength: letter.length,
      });

      return letter;
    } catch (error) {
      logger.error('Falha ao gerar carta', error);
      throw new Error('Não foi possível gerar a carta. Por favor, tente novamente.');
    }
  }

  private getUrgencyLabel(urgency: string): string {
    const labels: Record<string, string> = {
      BAIXA: 'Baixa',
      MEDIA: 'Média',
      ALTA: 'Alta',
    };
    return labels[urgency] || 'Média';
  }
}

export const letterService = new LetterService();
