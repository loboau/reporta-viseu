import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

/**
 * Extend FastifyRequest to include user information
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({
      success: false,
      error: 'Não autenticado. Por favor, faça login.',
    });
  }
}

/**
 * Authorization middleware - checks if user has required role
 */
export function authorize(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // First verify the JWT token
      await request.jwtVerify();

      const user = request.user as {
        id: string;
        email: string;
        name: string;
        role: UserRole;
      };

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return reply.status(403).send({
          success: false,
          error: 'Não tem permissões para aceder a este recurso.',
        });
      }
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Não autenticado. Por favor, faça login.',
      });
    }
  };
}
