import type { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';

export async function healthRoutes(fastify: FastifyInstance) {
  /**
   * Health check endpoint
   * GET /api/health
   */
  fastify.get('/api/health', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return reply.status(200).send({
        estado: 'operacional',
        timestamp: new Date().toISOString(),
        servico: 'reporta-viseu-backend',
        base_de_dados: 'ligada',
      });
    } catch (error) {
      return reply.status(503).send({
        estado: 'erro',
        timestamp: new Date().toISOString(),
        servico: 'reporta-viseu-backend',
        base_de_dados: 'desligada',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}
