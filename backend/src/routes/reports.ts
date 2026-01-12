import type { FastifyInstance } from 'fastify';
import { CreateReportSchema } from '../schemas/report.schema';
import { reportService } from '../services/ReportService';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export async function reportsRoutes(fastify: FastifyInstance) {
  /**
   * Create a new report
   * POST /api/reports
   */
  fastify.post<{
    Body: unknown;
  }>('/api/reports', async (request, reply) => {
    try {
      // Validate request body
      const validatedData = CreateReportSchema.parse(request.body);

      // Create report
      const report = await reportService.createReport(
        validatedData,
        validatedData.photoIds
      );

      return reply.status(201).send({
        success: true,
        data: report,
        message: 'Relatório criado com sucesso',
      });
    } catch (error) {
      logger.error('Falha ao criar relatório', error);

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
        error: 'Erro ao criar relatório',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * Get a report by reference
   * GET /api/reports/:reference
   */
  fastify.get<{
    Params: { reference: string };
  }>('/api/reports/:reference', async (request, reply) => {
    try {
      const { reference } = request.params;

      const report = await reportService.getReportByReference(reference);

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'Relatório não encontrado',
        });
      }

      return reply.status(200).send({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Falha ao obter relatório', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar relatório',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * List all reports with optional filters
   * GET /api/reports
   */
  fastify.get<{
    Querystring: {
      categoryId?: string;
      status?: string;
      limit?: string;
      offset?: string;
    };
  }>('/api/reports', async (request, reply) => {
    try {
      const { categoryId, status, limit, offset } = request.query;

      const reports = await reportService.listReports({
        categoryId,
        status,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      return reply.status(200).send({
        success: true,
        data: reports,
        count: reports.length,
      });
    } catch (error) {
      logger.error('Falha ao listar relatórios', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao listar relatórios',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}
