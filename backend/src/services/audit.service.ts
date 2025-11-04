import { v4 as uuidv4 } from 'uuid';
import { AuditLog, CreateAuditLogDto } from '../models/audit.model';

// In-memory storage for audit logs (replace with database in production)
const auditLogsStore: AuditLog[] = [];

export class AuditService {
  /**
   * Create an audit log entry
   */
  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuidv4(),
      ...data,
      timestamp: new Date(),
    };

    auditLogsStore.push(log);
    return log;
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
    let logs = [...auditLogsStore];

    if (filters.userId) {
      logs = logs.filter((l) => l.userId === filters.userId);
    }

    if (filters.resource) {
      logs = logs.filter((l) => l.resource === filters.resource);
    }

    if (filters.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }

    if (filters.startDate) {
      const startDate = filters.startDate;
      logs = logs.filter((l) => l.timestamp >= startDate);
    }

    if (filters.endDate) {
      const endDate = filters.endDate;
      logs = logs.filter((l) => l.timestamp <= endDate);
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    const limit = filters.limit || 100;
    return logs.slice(0, limit);
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resource: string, resourceId: string): Promise<AuditLog[]> {
    return auditLogsStore
      .filter((l) => l.resource === resource && l.resourceId === resourceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditService = new AuditService();
