import { z } from 'zod';

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password deve ter pelo menos 6 caracteres'),
});

/**
 * Refresh token request validation schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
