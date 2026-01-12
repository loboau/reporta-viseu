import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { ReportWithRelations } from './ReportService';

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
   */
  async generateLetter(report: ReportWithRelations): Promise<string> {
    try {
      logger.info('A gerar carta para relatório', { reportId: report.id });

      const urgencyLabel = this.getUrgencyLabel(report.urgency);
      const citizenInfo = report.isAnonymous
        ? 'Munícipe (anónimo)'
        : `${report.name} (${report.email}${report.phone ? `, tel: ${report.phone}` : ''})`;

      const prompt = `Você é um assistente especializado em redigir cartas formais para a administração pública portuguesa.

Redija uma carta formal em português de Portugal (PT-PT) para o departamento municipal "${report.category.departamento}" da Câmara Municipal de Viseu, relatando a seguinte ocorrência:

INFORMAÇÕES DA OCORRÊNCIA:
- Referência: ${report.reference}
- Categoria: ${report.category.label}
- Descrição: ${report.description}
- Localização: ${report.address}${report.freguesia ? `, ${report.freguesia}` : ''}
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
