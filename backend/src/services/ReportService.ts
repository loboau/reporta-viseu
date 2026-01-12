import { prisma } from '../config/database';
import { generateReference } from '../utils/generateReference';
import { logger } from '../utils/logger';
import type { CreateReportInput } from '../schemas/report.schema';
import type { Report, Photo, Category } from '@prisma/client';

export type ReportWithRelations = Report & {
  category: Category;
  photos: Photo[];
};

export class ReportService {
  /**
   * Creates a new report with photos
   */
  async createReport(
    data: CreateReportInput,
    photoIds?: string[]
  ): Promise<ReportWithRelations> {
    try {
      // Generate unique reference
      let reference = generateReference();
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure reference is unique
      while (attempts < maxAttempts) {
        const existing = await prisma.report.findUnique({
          where: { reference },
        });

        if (!existing) break;

        reference = generateReference();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Falha ao gerar referência única');
      }

      // Verify category exists and is active
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          ativo: true,
        },
      });

      if (!category) {
        throw new Error('Categoria não encontrada ou inativa');
      }

      // If not anonymous, check if category allows anonymous reports
      if (!data.isAnonymous && !category.permiteAnonimo) {
        // This is actually fine - category doesn't allow anonymous, but user is not anonymous
      } else if (data.isAnonymous && !category.permiteAnonimo) {
        throw new Error('Esta categoria não permite relatórios anónimos');
      }

      // Create report and link photos if provided
      const report = await prisma.report.create({
        data: {
          reference,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          freguesia: data.freguesia,
          categoryId: data.categoryId,
          description: data.description,
          urgency: data.urgency,
          isAnonymous: data.isAnonymous,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: 'PENDENTE',
        },
        include: {
          category: true,
          photos: true,
        },
      });

      // Link photos to the report if provided
      if (photoIds && photoIds.length > 0) {
        await prisma.photo.updateMany({
          where: {
            id: { in: photoIds },
            reportId: null, // Only link photos that aren't already linked
          },
          data: {
            reportId: report.id,
          },
        });

        // Refetch report with updated photos
        const updatedReport = await prisma.report.findUnique({
          where: { id: report.id },
          include: {
            category: true,
            photos: true,
          },
        });

        if (updatedReport) {
          return updatedReport;
        }
      }

      logger.info('Relatório criado com sucesso', {
        reportId: report.id,
        reference: report.reference,
      });

      return report;
    } catch (error) {
      logger.error('Falha ao criar relatório', error);
      throw error;
    }
  }

  /**
   * Retrieves a report by reference
   */
  async getReportByReference(reference: string): Promise<ReportWithRelations | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { reference },
        include: {
          category: true,
          photos: true,
        },
      });

      return report;
    } catch (error) {
      logger.error('Falha ao obter relatório por referência', error);
      throw error;
    }
  }

  /**
   * Retrieves a report by ID
   */
  async getReportById(id: string): Promise<ReportWithRelations | null> {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          category: true,
          photos: true,
        },
      });

      return report;
    } catch (error) {
      logger.error('Falha ao obter relatório por ID', error);
      throw error;
    }
  }

  /**
   * Updates a report's letter content
   */
  async updateReportLetter(reportId: string, letter: string): Promise<Report> {
    try {
      const report = await prisma.report.update({
        where: { id: reportId },
        data: {
          letter,
          status: 'PROCESSADO',
        },
      });

      logger.info('Carta do relatório atualizada', { reportId });

      return report;
    } catch (error) {
      logger.error('Falha ao atualizar carta do relatório', error);
      throw error;
    }
  }

  /**
   * Marks a report as email sent
   */
  async markEmailSent(reportId: string, emailSentTo: string): Promise<Report> {
    try {
      const report = await prisma.report.update({
        where: { id: reportId },
        data: {
          emailSentAt: new Date(),
          emailSentTo,
          status: 'ENVIADO',
        },
      });

      logger.info('Relatório marcado como email enviado', { reportId, emailSentTo });

      return report;
    } catch (error) {
      logger.error('Falha ao marcar email como enviado', error);
      throw error;
    }
  }

  /**
   * Lists all reports with optional filters
   */
  async listReports(filters?: {
    categoryId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReportWithRelations[]> {
    try {
      const reports = await prisma.report.findMany({
        where: {
          ...(filters?.categoryId && { categoryId: filters.categoryId }),
          ...(filters?.status && { status: filters.status as any }),
        },
        include: {
          category: true,
          photos: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });

      return reports;
    } catch (error) {
      logger.error('Falha ao listar relatórios', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
