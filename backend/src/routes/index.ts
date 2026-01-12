import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { categoriesRoutes } from './categories';
import { reportsRoutes } from './reports';
import { letterRoutes } from './letter';
import { uploadRoutes } from './upload';
import { adminRoutes } from './admin';
import { authRoutes } from './auth.routes';

/**
 * Register all application routes
 */
export async function registerRoutes(fastify: FastifyInstance) {
  // Health check
  await fastify.register(healthRoutes);

  // Auth routes (with /api/auth prefix)
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // Categories
  await fastify.register(categoriesRoutes);

  // Reports
  await fastify.register(reportsRoutes);

  // Letter generation
  await fastify.register(letterRoutes);

  // File uploads
  await fastify.register(uploadRoutes);

  // Admin routes
  await fastify.register(adminRoutes);
}
