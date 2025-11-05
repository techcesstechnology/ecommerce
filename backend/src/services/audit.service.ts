import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { AuditLog } from '../models/audit-log.entity';
import { CreateAuditLogDto } from '../models/audit.model';

export class AuditService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create an audit log entry
   */
  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const log = this.auditLogRepository.create(data);
      return await this.auditLogRepository.save(log);
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw new Error('Failed to create audit log');
    }
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: string;
    resource?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      const query = this.auditLogRepository.createQueryBuilder('audit_log');

      if (filters.userId) {
        query.andWhere('audit_log.userId = :userId', { userId: filters.userId });
      }

      if (filters.resource) {
        query.andWhere('audit_log.resource = :resource', { resource: filters.resource });
      }

      if (filters.action) {
        query.andWhere('audit_log.action = :action', { action: filters.action });
      }

      if (filters.startDate && filters.endDate) {
        query.andWhere('audit_log.timestamp BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        query.andWhere('audit_log.timestamp >= :startDate', { startDate: filters.startDate });
      } else if (filters.endDate) {
        query.andWhere('audit_log.timestamp <= :endDate', { endDate: filters.endDate });
      }

      // Sort by timestamp descending (newest first)
      query.orderBy('audit_log.timestamp', 'DESC');

      // Apply limit
      const limit = filters.limit || 100;
      query.take(limit);

      return await query.getMany();
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resource: string, resourceId: string): Promise<AuditLog[]> {
    try {
      return await this.auditLogRepository.find({
        where: {
          resource,
          resourceId,
        },
        order: {
          timestamp: 'DESC',
        },
      });
    } catch (error) {
      console.error('Error fetching resource logs:', error);
      throw new Error('Failed to fetch resource logs');
    }
  }
}

export const auditService = new AuditService();
