import type { FastifyInstance } from 'fastify';
import { adminService } from '../services/AdminService';
import { logger } from '../utils/logger';
import { ZodError, z } from 'zod';
import type { ReportStatus, Urgency } from '@prisma/client';

// Validation schemas
const UpdateStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSADO', 'ENVIADO', 'EM_PROGRESSO', 'RESOLVIDO', 'FECHADO']),
  changedBy: z.string().optional(),
  notes: z.string().optional(),
});

const AddNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  author: z.string().optional(),
});

const UpdateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

const AssignReportSchema = z.object({
  assignedTo: z.string().min(1, 'Assigned to is required'),
});

const CategorySchema = z.object({
  slug: z.string().min(1),
  icon: z.string().min(1),
  label: z.string().min(1),
  sublabel: z.string().min(1),
  departamento: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().optional(),
  permiteAnonimo: z.boolean().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().optional(),
});

const UpdateCategorySchema = CategorySchema.partial();

export async function adminRoutes(fastify: FastifyInstance) {
  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  fastify.get('/api/admin/stats', async (request, reply) => {
    try {
      const stats = await adminService.getDashboardStats();

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Failed to get dashboard stats', error);

      return reply.status(500).send({
        success: false,
        error: 'Error loading dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get all reports with filters
   * GET /api/admin/reports
   */
  fastify.get<{
    Querystring: {
      status?: ReportStatus;
      categoryId?: string;
      urgency?: Urgency;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      limit?: string;
      offset?: string;
    };
  }>('/api/admin/reports', async (request, reply) => {
    try {
      const { status, categoryId, urgency, dateFrom, dateTo, search, limit, offset } = request.query;

      const filters = {
        status,
        categoryId,
        urgency,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      };

      const result = await adminService.getReports(filters);

      return reply.status(200).send({
        success: true,
        data: result.reports,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      logger.error('Failed to get reports', error);

      return reply.status(500).send({
        success: false,
        error: 'Error loading reports',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get a single report by ID
   * GET /api/admin/reports/:id
   */
  fastify.get<{
    Params: { id: string };
  }>('/api/admin/reports/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const report = await adminService.getReportById(id);

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'Report not found',
        });
      }

      return reply.status(200).send({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Failed to get report', error);

      return reply.status(500).send({
        success: false,
        error: 'Error loading report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update report status
   * PATCH /api/admin/reports/:id/status
   */
  fastify.patch<{
    Params: { id: string };
    Body: unknown;
  }>('/api/admin/reports/:id/status', async (request, reply) => {
    try {
      const { id } = request.params;
      const validatedData = UpdateStatusSchema.parse(request.body);

      const report = await adminService.updateReportStatus(
        id,
        validatedData.status,
        validatedData.changedBy,
        validatedData.notes
      );

      return reply.status(200).send({
        success: true,
        data: report,
        message: 'Report status updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update report status', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error updating report status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Add internal note to report
   * POST /api/admin/reports/:id/notes
   */
  fastify.post<{
    Params: { id: string };
    Body: unknown;
  }>('/api/admin/reports/:id/notes', async (request, reply) => {
    try {
      const { id } = request.params;
      const validatedData = AddNoteSchema.parse(request.body);

      const note = await adminService.addInternalNote(
        id,
        validatedData.content,
        validatedData.author
      );

      return reply.status(201).send({
        success: true,
        data: note,
        message: 'Note added successfully',
      });
    } catch (error) {
      logger.error('Failed to add note', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error adding note',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update internal note
   * PATCH /api/admin/notes/:noteId
   */
  fastify.patch<{
    Params: { noteId: string };
    Body: unknown;
  }>('/api/admin/notes/:noteId', async (request, reply) => {
    try {
      const { noteId } = request.params;
      const validatedData = UpdateNoteSchema.parse(request.body);

      const note = await adminService.updateInternalNote(noteId, validatedData.content);

      return reply.status(200).send({
        success: true,
        data: note,
        message: 'Note updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update note', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error updating note',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Delete internal note
   * DELETE /api/admin/notes/:noteId
   */
  fastify.delete<{
    Params: { noteId: string };
  }>('/api/admin/notes/:noteId', async (request, reply) => {
    try {
      const { noteId } = request.params;

      await adminService.deleteInternalNote(noteId);

      return reply.status(200).send({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete note', error);

      return reply.status(500).send({
        success: false,
        error: 'Error deleting note',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Assign report
   * PATCH /api/admin/reports/:id/assign
   */
  fastify.patch<{
    Params: { id: string };
    Body: unknown;
  }>('/api/admin/reports/:id/assign', async (request, reply) => {
    try {
      const { id } = request.params;
      const validatedData = AssignReportSchema.parse(request.body);

      const report = await adminService.assignReport(id, validatedData.assignedTo);

      return reply.status(200).send({
        success: true,
        data: report,
        message: 'Report assigned successfully',
      });
    } catch (error) {
      logger.error('Failed to assign report', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error assigning report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Get all categories (including inactive)
   * GET /api/admin/categories
   */
  fastify.get('/api/admin/categories', async (request, reply) => {
    try {
      const categories = await adminService.getAllCategories();

      return reply.status(200).send({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Failed to get categories', error);

      return reply.status(500).send({
        success: false,
        error: 'Error loading categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Create category
   * POST /api/admin/categories
   */
  fastify.post<{
    Body: unknown;
  }>('/api/admin/categories', async (request, reply) => {
    try {
      const validatedData = CategorySchema.parse(request.body);

      const category = await adminService.createCategory(validatedData);

      return reply.status(201).send({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      logger.error('Failed to create category', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error creating category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Update category
   * PATCH /api/admin/categories/:id
   */
  fastify.patch<{
    Params: { id: string };
    Body: unknown;
  }>('/api/admin/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const validatedData = UpdateCategorySchema.parse(request.body);

      const category = await adminService.updateCategory(id, validatedData);

      return reply.status(200).send({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      logger.error('Failed to update category', error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid data',
          details: error.errors,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Error updating category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Delete category (soft delete)
   * DELETE /api/admin/categories/:id
   */
  fastify.delete<{
    Params: { id: string };
  }>('/api/admin/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const category = await adminService.deleteCategory(id);

      return reply.status(200).send({
        success: true,
        data: category,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete category', error);

      return reply.status(500).send({
        success: false,
        error: 'Error deleting category',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
