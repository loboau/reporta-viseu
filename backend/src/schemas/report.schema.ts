import { z } from 'zod';

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitizes text by removing control characters and trimming
 */
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitizes HTML by stripping tags and dangerous content
 */
function sanitizeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

/**
 * Portuguese email regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Portuguese phone regex (mobile and landline)
 */
const PHONE_REGEX = /^(\+351\s?)?[29]\d{8}$/;

// ============================================================================
// ENUMS
// ============================================================================

export const UrgencyEnum = z.enum(['BAIXA', 'MEDIA', 'ALTA']);
export const ReportStatusEnum = z.enum(['PENDENTE', 'PROCESSADO', 'ENVIADO', 'RESOLVIDO']);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Enhanced validation schema for creating a report with XSS protection
 */
export const CreateReportSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  address: z
    .string()
    .min(1, 'Morada é obrigatória')
    .max(500, 'Morada demasiado longa')
    .transform(sanitizeHtml),
  freguesia: z
    .string()
    .max(100, 'Nome da freguesia demasiado longo')
    .transform(sanitizeText)
    .optional(),
  categoryId: z.string().uuid('ID de categoria inválido'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'A descrição não pode exceder 2000 caracteres')
    .transform(sanitizeHtml)
    .refine(
      (val) => {
        // Check for XSS attempts
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /<iframe/i,
          /<object/i,
          /<embed/i,
          /eval\s*\(/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(val));
      },
      {
        message: 'A descrição contém conteúdo não permitido',
      }
    ),
  urgency: UrgencyEnum.default('MEDIA'),
  isAnonymous: z.boolean().default(false),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome demasiado longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
    .transform(sanitizeText)
    .optional(),
  email: z
    .string()
    .max(254, 'Email demasiado longo')
    .regex(EMAIL_REGEX, 'Formato de email inválido')
    .email('Email inválido')
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .max(20, 'Telefone demasiado longo')
    .transform((val) => val.replace(/[\s\-()]/g, ''))
    .refine(
      (val) => {
        if (!val) return true;
        return PHONE_REGEX.test(val);
      },
      {
        message: 'Número de telefone português inválido',
      }
    )
    .optional(),
  photoIds: z.array(z.string().uuid('ID de foto inválido')).max(5, 'Máximo de 5 fotos permitido').optional(),
}).refine(
  (data) => {
    // If not anonymous, name and email are required
    if (!data.isAnonymous) {
      return !!(data.name && data.email);
    }
    return true;
  },
  {
    message: 'Nome e email são obrigatórios para relatórios não anónimos',
    path: ['name'],
  }
);

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

// Schema for generating a letter
export const GenerateLetterSchema = z.object({
  reportId: z.string().uuid('ID de relatório inválido'),
});

export type GenerateLetterInput = z.infer<typeof GenerateLetterSchema>;

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

/**
 * Maximum file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Schema for photo metadata with security validation
 */
export const PhotoMetadataSchema = z.object({
  filename: z
    .string()
    .min(1, 'Nome do ficheiro é obrigatório')
    .max(255, 'Nome do ficheiro demasiado longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Nome do ficheiro contém caracteres inválidos'),
  originalName: z
    .string()
    .min(1, 'Nome original do ficheiro é obrigatório')
    .max(255, 'Nome original do ficheiro demasiado longo')
    .transform(sanitizeText),
  mimeType: z
    .string()
    .refine(
      (val) => ALLOWED_IMAGE_TYPES.includes(val as any),
      {
        message: 'Tipo de ficheiro não suportado. Use apenas JPG, PNG ou WebP.',
      }
    ),
  size: z
    .number()
    .positive('Tamanho do ficheiro deve ser positivo')
    .max(MAX_FILE_SIZE, 'Ficheiro muito grande. Tamanho máximo: 5MB'),
  url: z.string().url('URL do ficheiro inválido'),
});

export type PhotoMetadata = z.infer<typeof PhotoMetadataSchema>;
