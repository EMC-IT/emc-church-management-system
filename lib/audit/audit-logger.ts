export interface AuditActor {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuditEventPayload {
  id?: string;
  timestamp?: string;
  actor: AuditActor;
  action: string;
  resource: string;
  resourceId: string;
  tenantId: string;
  branchId?: string;
  status?: 'SUCCESS' | 'FAILURE';
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AuditEvent extends Required<Omit<AuditEventPayload, 'branchId' | 'before' | 'after' | 'metadata'>> {
  branchId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private static inMemoryLogs: AuditEvent[] = [];

  /**
   * Logs a structured, immutable security or financial audit event.
   */
  static async log(event: AuditEventPayload): Promise<AuditEvent> {
    const fullEvent: AuditEvent = {
      id: event.id || `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      actor: event.actor,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      tenantId: event.tenantId,
      branchId: event.branchId,
      status: event.status || 'SUCCESS',
      before: event.before,
      after: event.after,
      metadata: event.metadata,
    };

    AuditLogger.inMemoryLogs.unshift(fullEvent);

    // Keep memory bounded to latest 500 records
    if (AuditLogger.inMemoryLogs.length > 500) {
      AuditLogger.inMemoryLogs = AuditLogger.inMemoryLogs.slice(0, 500);
    }

    return fullEvent;
  }

  /**
   * Retrieves recent audit logs filtered by tenant and optional resource/branch.
   */
  static getAuditLogs(filters: { tenantId?: string; resource?: string; branchId?: string } = {}): AuditEvent[] {
    return AuditLogger.inMemoryLogs.filter(log => {
      if (filters.tenantId && log.tenantId !== filters.tenantId) return false;
      if (filters.resource && log.resource !== filters.resource) return false;
      if (filters.branchId && log.branchId !== filters.branchId) return false;
      return true;
    });
  }
}

export const auditLogger = AuditLogger;
