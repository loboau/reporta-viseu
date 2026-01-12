import type { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export async function categoriesRoutes(fastify: FastifyInstance) {
  /**
   * Get all active categories
   * GET /api/categories
   */
  fastify.get('/api/categories', async (request, reply) => {
    try {
      const categories = await prisma.category.findMany({
        where: {
          ativo: true,
        },
        orderBy: {
          ordem: 'asc',
        },
      });

      return reply.status(200).send({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Falha ao obter categorias', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar categorias',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * Get a single category by ID or slug
   * GET /api/categories/:identifier
   */
  fastify.get<{
    Params: { identifier: string };
  }>('/api/categories/:identifier', async (request, reply) => {
    try {
      const { identifier } = request.params;

      // Try to find by ID first, then by slug
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: identifier },
            { slug: identifier },
          ],
          ativo: true,
        },
      });

      if (!category) {
        return reply.status(404).send({
          success: false,
          error: 'Categoria não encontrada',
        });
      }

      return reply.status(200).send({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Falha ao obter categoria', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar categoria',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}
