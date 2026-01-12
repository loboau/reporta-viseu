import type { FastifyInstance } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadRoutes(fastify: FastifyInstance) {
  /**
   * Upload a photo
   * POST /api/upload
   */
  fastify.post('/api/upload', async (request, reply) => {
    try {
      // Ensure upload directory exists
      await fs.mkdir(env.UPLOAD_DIR, { recursive: true });

      // Get the uploaded file
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum ficheiro foi enviado',
        });
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'Tipo de ficheiro não permitido. Use JPEG, PNG, WebP ou HEIC.',
        });
      }

      // Read file into buffer to check size
      const buffer = await data.toBuffer();

      // Validate file size
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          error: 'Ficheiro demasiado grande. Tamanho máximo: 10MB',
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(data.filename);
      const filename = `${uuidv4()}${fileExtension}`;
      const filepath = path.join(env.UPLOAD_DIR, filename);

      // Save file to disk
      await fs.writeFile(filepath, buffer);

      // Create photo record in database (without reportId, will be linked later)
      const photo = await prisma.photo.create({
        data: {
          filename,
          originalName: data.filename,
          mimeType: data.mimetype,
          size: buffer.length,
          url: `/uploads/${filename}`,
        },
      });

      logger.info('Foto carregada com sucesso', {
        photoId: photo.id,
        filename,
        size: buffer.length,
      });

      return reply.status(201).send({
        success: true,
        data: {
          id: photo.id,
          filename: photo.filename,
          originalName: photo.originalName,
          mimeType: photo.mimeType,
          size: photo.size,
          url: photo.url,
        },
        message: 'Ficheiro carregado com sucesso',
      });
    } catch (error) {
      logger.error('Falha ao carregar foto', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar ficheiro',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * Upload multiple photos
   * POST /api/upload/multiple
   */
  fastify.post('/api/upload/multiple', async (request, reply) => {
    try {
      // Ensure upload directory exists
      await fs.mkdir(env.UPLOAD_DIR, { recursive: true });

      const parts = request.parts();
      const uploadedPhotos: any[] = [];
      const errors: string[] = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const file = part as MultipartFile;

          try {
            // Validate file type
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              errors.push(`${file.filename}: Tipo de ficheiro não permitido`);
              continue;
            }

            // Read file into buffer
            const buffer = await file.toBuffer();

            // Validate file size
            if (buffer.length > MAX_FILE_SIZE) {
              errors.push(`${file.filename}: Ficheiro demasiado grande (máx: 10MB)`);
              continue;
            }

            // Generate unique filename
            const fileExtension = path.extname(file.filename);
            const filename = `${uuidv4()}${fileExtension}`;
            const filepath = path.join(env.UPLOAD_DIR, filename);

            // Save file to disk
            await fs.writeFile(filepath, buffer);

            // Create photo record in database (without reportId, will be linked later)
            const photo = await prisma.photo.create({
              data: {
                filename,
                originalName: file.filename,
                mimeType: file.mimetype,
                size: buffer.length,
                url: `/uploads/${filename}`,
              },
            });

            uploadedPhotos.push({
              id: photo.id,
              filename: photo.filename,
              originalName: photo.originalName,
              mimeType: photo.mimeType,
              size: photo.size,
              url: photo.url,
            });
          } catch (fileError) {
            logger.error('Falha ao carregar ficheiro', fileError);
            errors.push(`${file.filename}: Erro ao processar ficheiro`);
          }
        }
      }

      if (uploadedPhotos.length === 0 && errors.length > 0) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum ficheiro foi carregado com sucesso',
          details: errors,
        });
      }

      return reply.status(201).send({
        success: true,
        data: uploadedPhotos,
        errors: errors.length > 0 ? errors : undefined,
        message: `${uploadedPhotos.length} ficheiro(s) carregado(s) com sucesso`,
      });
    } catch (error) {
      logger.error('Falha ao carregar múltiplas fotos', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao carregar ficheiros',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  /**
   * Delete a photo
   * DELETE /api/upload/:photoId
   */
  fastify.delete<{
    Params: { photoId: string };
  }>('/api/upload/:photoId', async (request, reply) => {
    try {
      const { photoId } = request.params;

      // Get photo record
      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
      });

      if (!photo) {
        return reply.status(404).send({
          success: false,
          error: 'Foto não encontrada',
        });
      }

      // Delete file from disk
      const filepath = path.join(env.UPLOAD_DIR, photo.filename);
      try {
        await fs.unlink(filepath);
      } catch (fileError) {
        logger.warn('Falha ao eliminar ficheiro do disco', { filepath, error: fileError });
      }

      // Delete photo record from database
      await prisma.photo.delete({
        where: { id: photoId },
      });

      logger.info('Foto eliminada com sucesso', { photoId });

      return reply.status(200).send({
        success: true,
        message: 'Foto eliminada com sucesso',
      });
    } catch (error) {
      logger.error('Falha ao eliminar foto', error);

      return reply.status(500).send({
        success: false,
        error: 'Erro ao eliminar foto',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}
