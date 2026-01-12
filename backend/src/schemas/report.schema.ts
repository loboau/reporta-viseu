import { z } from 'zod';

// Enums matching Prisma schema
export const UrgencyEnum = z.enum(['BAIXA', 'MEDIA', 'ALTA']);
export const ReportStatusEnum = z.enum(['PENDENTE', 'PROCESSADO', 'ENVIADO', 'RESOLVIDO']);

// Validation schema for creating a report
export const CreateReportSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida'),
  address: z.string().min(1, 'Morada é obrigatória'),
  freguesia: z.string().optional(),
  categoryId: z.string().uuid('ID de categoria inválido'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres').max(2000, 'A descrição não pode exceder 2000 caracteres'),
  urgency: UrgencyEnum.default('MEDIA'),
  isAnonymous: z.boolean().default(false),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(9, 'Telefone inválido').optional(),
  photoIds: z.array(z.string().uuid()).optional(),
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

// Schema for photo metadata
export const PhotoMetadataSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
});

export type PhotoMetadata = z.infer<typeof PhotoMetadataSchema>;
