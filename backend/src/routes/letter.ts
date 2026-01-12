import type { FastifyInstance } from 'fastify';
import { GenerateLetterSchema } from '../schemas/report.schema';
import { reportService } from '../services/ReportService';
import { letterService } from '../services/LetterService';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export async function letterRoutes(fastify: FastifyInstance) {
  /**
   * Generate a formal letter for a report
   * POST /api/letter/generate
   */
  fastify.post<{
    Body: unknown;
  }>('/api/letter/generate', async (request, reply) => {
    try {
      // Validate request body
      const validatedData = GenerateLetterSchema.parse(request.body);

      // Get report with relations
      const report = await reportService.getReportById(validatedData.reportId);

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'Relatório não encontrado',
        });
      }

      // Generate letter using Claude AI
      const letter = await letterService.generateLetter(report);

      // Update report with generated letter
      await reportService.updateReportLetter(report.id, letter);

      return reply.status(200).send({
        success: true,
        data: {
          reportId: report.id,
          reference: report.reference,
          letter,
        },
        message: 'Carta gerada com sucesso',
      });
    } catch (error) {
      logger.error('Falha ao gerar carta', error);

      // Handle validation errors
      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Dados inválidos',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Handle other errors
      return reply.status(500).send({
        success: false,
        error: 'Erro ao gerar carta',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * Get the letter for a report by reference
   * GET /api/letter/:reference
   */
  fastify.get<{
    Params: { reference: string };
  }>('/api/letter/:reference', async (request, reply) => {
    try {
      const { reference } = request.params;

      const report = await reportService.getReportByReference(reference);

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'Relatório não encontrado',
        });
      }

      if (!report.letter) {
        return reply.status(404).send({
          success: false,
          error: 'Carta ainda não foi gerada para este relatório',
        });
      }

      return reply.status(200).send({
        success: true,
        data: {
          reportId: report.id,
          reference: report.reference,
          letter: report.letter,
          generatedAt: report.updatedAt,
        },
      });
    } catch (error) {
      logger.error('Falha ao obter carta', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar carta',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}
