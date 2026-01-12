import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service';
import { loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { authenticate } from '../middleware/auth';
import { createJWTPayload, JWT_CONFIG } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Auth routes
 */
export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint with rate limiting
  fastify.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5, // 5 attempts
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      try {
        // Validate request body
        const credentials = loginSchema.parse(request.body);

        // Get session context
        const context = {
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        };

        // Authenticate user
        const result = await authService.login(credentials, context);

        // Create JWT access token
        const accessToken = fastify.jwt.sign(
          createJWTPayload(result.user),
          { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
        );

        logger.info('User logged in successfully', {
          userId: result.user.id,
          email: result.user.email,
          ipAddress: context.ipAddress,
        });

        return reply.status(200).send({
          success: true,
          data: {
            accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
          },
        });
      } catch (error: any) {
        logger.error('Login failed', {
          error: error.message,
          email: (request.body as any)?.email,
          ipAddress: request.ip,
        });

        return reply.status(401).send({
          success: false,
          error: error.message || 'Falha na autenticação',
        });
      }
    }
  );

  // Refresh token endpoint
  fastify.post('/refresh', async (request, reply) => {
    try {
      // Validate request body
      const { refreshToken } = refreshTokenSchema.parse(request.body);

      // Refresh access token
      const result = await authService.refreshToken(refreshToken);

      // Create new JWT access token
      const accessToken = fastify.jwt.sign(
        createJWTPayload(result.user),
        { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
      );

      logger.info('Token refreshed successfully', {
        userId: result.user.id,
      });

      return reply.status(200).send({
        success: true,
        data: {
          accessToken,
          user: result.user,
        },
      });
    } catch (error: any) {
      logger.error('Token refresh failed', {
        error: error.message,
      });

      return reply.status(401).send({
        success: false,
        error: error.message || 'Sessão inválida ou expirada',
      });
    }
  });

  // Logout endpoint (protected)
  fastify.post(
    '/logout',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };

        if (refreshToken) {
          await authService.logout(refreshToken);
        }

        logger.info('User logged out successfully', {
          userId: request.user?.id,
        });

        return reply.status(200).send({
          success: true,
          message: 'Logout efetuado com sucesso',
        });
      } catch (error: any) {
        logger.error('Logout failed', {
          error: error.message,
          userId: request.user?.id,
        });

        return reply.status(500).send({
          success: false,
          error: 'Erro ao efetuar logout',
        });
      }
    }
  );

  // Get current user endpoint (protected)
  fastify.get(
    '/me',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Não autenticado',
          });
        }

        const user = await authService.getUserById(request.user.id);

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: 'Utilizador não encontrado',
          });
        }

        return reply.status(200).send({
          success: true,
          data: user,
        });
      } catch (error: any) {
        logger.error('Get current user failed', {
          error: error.message,
          userId: request.user?.id,
        });

        return reply.status(500).send({
          success: false,
          error: 'Erro ao obter dados do utilizador',
        });
      }
    }
  );

  // Get user sessions (protected)
  fastify.get(
    '/sessions',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Não autenticado',
          });
        }

        const sessions = await authService.getUserSessions(request.user.id);

        return reply.status(200).send({
          success: true,
          data: sessions,
        });
      } catch (error: any) {
        logger.error('Get sessions failed', {
          error: error.message,
          userId: request.user?.id,
        });

        return reply.status(500).send({
          success: false,
          error: 'Erro ao obter sessões',
        });
      }
    }
  );
}
