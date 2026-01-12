import { PrismaClient, User, UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateRefreshToken, JWT_CONFIG } from '../utils/jwt';

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  sessionId: string;
  refreshToken: string;
}

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(
    credentials: LoginCredentials,
    context: SessionContext
  ): Promise<LoginResult> {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Conta desativada. Contacte o administrador.');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken();

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt: new Date(Date.now() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      sessionId: session.id,
      refreshToken: session.refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }> {
    // Find valid session
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new Error('Sessão inválida');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error('Sessão expirada');
    }

    // Check if user is active
    if (!session.user.isActive) {
      throw new Error('Conta desativada');
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    };
  }

  /**
   * Logout user and invalidate session
   */
  async logout(refreshToken: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    lastLoginAt: Date | null;
    createdAt: Date;
  } | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Revoke all sessions for a user except the current one
   */
  async revokeOtherSessions(userId: string, currentSessionId: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
        id: {
          not: currentSessionId,
        },
      },
    });
  }
}

export const authService = new AuthService();
