import { randomBytes } from 'crypto';

/**
 * JWT configuration
 */
export const JWT_CONFIG = {
  // Access token expires in 15 minutes
  ACCESS_TOKEN_EXPIRY: '15m',
  // Refresh token expires in 7 days
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

/**
 * Extract user information for JWT payload
 */
export function createJWTPayload(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
