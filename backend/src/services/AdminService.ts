import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import type { ReportStatus, Urgency } from '@prisma/client';

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolvedReports: number;
  reportsByCategory: {
    categoryId: string;
    categoryLabel: string;
    count: number;
  }[];
  reportsByStatus: {
    status: ReportStatus;
    count: number;
  }[];
  reportsByUrgency: {
    urgency: Urgency;
    count: number;
  }[];
  recentReports: any[];
}

export interface ReportFilters {
  status?: ReportStatus;
  categoryId?: string;
  urgency?: Urgency;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total counts by status
      const [total, pending, inProgress, resolved] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { status: 'PENDENTE' } }),
        prisma.report.count({ where: { status: 'EM_PROGRESSO' } }),
        prisma.report.count({ where: { status: 'RESOLVIDO' } }),
      ]);

      // Get reports by category
      const reportsByCategory = await prisma.report.groupBy({
        by: ['categoryId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      // Get category labels
      const categories = await prisma.category.findMany({
        select: { id: true, label: true },
      });

      const categoryMap = new Map(categories.map(c => [c.id, c.label]));

      const reportsByCategoryWithLabels = reportsByCategory.map(item => ({
        categoryId: item.categoryId,
        categoryLabel: categoryMap.get(item.categoryId) || 'Desconhecido',
        count: item._count.id,
      }));

      // Get reports by status
      const reportsByStatus = await prisma.report.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      const reportsByStatusFormatted = reportsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
      }));

      // Get reports by urgency
      const reportsByUrgency = await prisma.report.groupBy({
        by: ['urgency'],
        _count: {
          id: true,
        },
      });

      const reportsByUrgencyFormatted = reportsByUrgency.map(item => ({
        urgency: item.urgency,
        count: item._count.id,
      }));

      // Get recent reports
      const recentReports = await prisma.report.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          photos: {
            take: 1,
          },
        },
      });

      return {
        totalReports: total,
        pendingReports: pending,
        inProgressReports: inProgress,
        resolvedReports: resolved,
        reportsByCategory: reportsByCategoryWithLabels,
        reportsByStatus: reportsByStatusFormatted,
        reportsByUrgency: reportsByUrgencyFormatted,
        recentReports,
      };
    } catch (error) {
      logger.error('Failed to get dashboard stats', error);
      throw error;
    }
  }

  /**
   * Get all reports with filters for admin
   */
  async getReports(filters: ReportFilters = {}) {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.urgency) {
        where.urgency = filters.urgency;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo;
        }
      }

      if (filters.search) {
        where.OR = [
          { reference: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            category: true,
            photos: {
              take: 1,
            },
            _count: {
              select: {
                notes: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 50,
          skip: filters.offset || 0,
        }),
        prisma.report.count({ where }),
      ]);

      return {
        reports,
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };
    } catch (error) {
      logger.error('Failed to get reports', error);
      throw error;
    }
  }

  /**
   * Get a single report by ID with all relations
   */
  async getReportById(id: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          category: true,
          photos: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return report;
    } catch (error) {
      logger.error('Failed to get report by ID', error);
      throw error;
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    changedBy?: string,
    notes?: string
  ) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Update report and create status history in a transaction
      const result = await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: { status: newStatus },
        }),
        prisma.statusHistory.create({
          data: {
            reportId,
            previousStatus: report.status,
            newStatus,
            changedBy,
            notes,
          },
        }),
      ]);

      logger.info('Report status updated', {
        reportId,
        previousStatus: report.status,
        newStatus,
      });

      return result[0];
    } catch (error) {
      logger.error('Failed to update report status', error);
      throw error;
    }
  }

  /**
   * Add internal note to report
   */
  async addInternalNote(reportId: string, content: string, author?: string) {
    try {
      const note = await prisma.internalNote.create({
        data: {
          reportId,
          content,
          author,
        },
      });

      logger.info('Internal note added', { reportId, noteId: note.id });

      return note;
    } catch (error) {
      logger.error('Failed to add internal note', error);
      throw error;
    }
  }

  /**
   * Update internal note
   */
  async updateInternalNote(noteId: string, content: string) {
    try {
      const note = await prisma.internalNote.update({
        where: { id: noteId },
        data: { content },
      });

      logger.info('Internal note updated', { noteId });

      return note;
    } catch (error) {
      logger.error('Failed to update internal note', error);
      throw error;
    }
  }

  /**
   * Delete internal note
   */
  async deleteInternalNote(noteId: string) {
    try {
      await prisma.internalNote.delete({
        where: { id: noteId },
      });

      logger.info('Internal note deleted', { noteId });
    } catch (error) {
      logger.error('Failed to delete internal note', error);
      throw error;
    }
  }

  /**
   * Assign report to someone
   */
  async assignReport(reportId: string, assignedTo: string) {
    try {
      const report = await prisma.report.update({
        where: { id: reportId },
        data: { assignedTo },
      });

      logger.info('Report assigned', { reportId, assignedTo });

      return report;
    } catch (error) {
      logger.error('Failed to assign report', error);
      throw error;
    }
  }

  /**
   * Get all categories for admin (including inactive)
   */
  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { ordem: 'asc' },
        include: {
          _count: {
            select: {
              reports: true,
            },
          },
        },
      });

      return categories;
    } catch (error) {
      logger.error('Failed to get all categories', error);
      throw error;
    }
  }

  /**
   * Create category
   */
  async createCategory(data: {
    slug: string;
    icon: string;
    label: string;
    sublabel: string;
    departamento: string;
    email: string;
    telefone?: string;
    permiteAnonimo?: boolean;
    ativo?: boolean;
    ordem?: number;
  }) {
    try {
      const category = await prisma.category.create({
        data,
      });

      logger.info('Category created', { categoryId: category.id });

      return category;
    } catch (error) {
      logger.error('Failed to create category', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: {
      slug?: string;
      icon?: string;
      label?: string;
      sublabel?: string;
      departamento?: string;
      email?: string;
      telefone?: string;
      permiteAnonimo?: boolean;
      ativo?: boolean;
      ordem?: number;
    }
  ) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data,
      });

      logger.info('Category updated', { categoryId: id });

      return category;
    } catch (error) {
      logger.error('Failed to update category', error);
      throw error;
    }
  }

  /**
   * Delete category (soft delete by setting ativo to false)
   */
  async deleteCategory(id: string) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: { ativo: false },
      });

      logger.info('Category deleted (soft)', { categoryId: id });

      return category;
    } catch (error) {
      logger.error('Failed to delete category', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
