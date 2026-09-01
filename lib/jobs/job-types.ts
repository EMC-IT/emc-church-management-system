export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type JobType = 
  | 'MEMBER_BULK_IMPORT'
  | 'COMMUNICATIONS_SMS_CAMPAIGN'
  | 'COMMUNICATIONS_EMAIL_NEWSLETTER'
  | 'REPORT_GENERATION'
  | 'DOCUMENT_OCR_PROCESSING'
  | 'DATABASE_BACKUP_EXPORT';

export interface JobProgress {
  total: number;
  processed: number;
  failed: number;
  percentage: number;
}

export interface BackgroundJob<TPayload = any, TResult = any> {
  id: string;
  type: JobType;
  tenantId: string;
  branchId?: string;
  requestedBy: {
    id: string;
    email: string;
  };
  payload: TPayload;
  status: JobStatus;
  progress: JobProgress;
  result?: TResult;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface JobHandler<TPayload = any, TResult = any> {
  execute(job: BackgroundJob<TPayload, TResult>): Promise<TResult>;
}
