import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { env } from './config/env';
import { logger } from './utils/logger';
import { registerRoutes } from './routes';
import path from 'path';

/**
 * Creates and configures the Fastify application
 */
export async function createApp() {
  const fastify = Fastify({
    logger: false, // We use our custom logger
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    bodyLimit: 15 * 1024 * 1024, // 15MB for file uploads
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        cb(null, true);
        return;
      }

      // In production, you should whitelist specific domains
      if (env.NODE_ENV === 'development') {
        cb(null, true);
        return;
      }

      // Whitelist production domains
      const allowedOrigins = [
        'https://reporta-viseu.pt',
        'https://www.reporta-viseu.pt',
      ];

      if (allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }

      cb(new Error('Não permitido por CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Multipart/form-data support for file uploads
  await fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 5, // Max 5 files per request
      headerPairs: 2000,
    },
  });

  // Serve static files from uploads directory
  const fastifyStatic = require('@fastify/static');
  await fastify.register(fastifyStatic, {
    root: env.UPLOAD_DIR,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Request logging
  fastify.addHook('onRequest', async (request, reply) => {
    logger.info('Pedido recebido', {
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  });

  // Response logging
  fastify.addHook('onResponse', async (request, reply) => {
    logger.info('Pedido concluído', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    });
  });

  // Error handling
  fastify.setErrorHandler((error, request, reply) => {
    logger.error('Erro no pedido', {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
    });

    // Don't expose internal errors in production
    const message = env.NODE_ENV === 'development'
      ? error.message
      : 'Erro interno do servidor';

    reply.status(error.statusCode || 500).send({
      success: false,
      error: message,
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Rota não encontrada',
      path: request.url,
    });
  });

  // Register all routes
  await registerRoutes(fastify);

  return fastify;
}
