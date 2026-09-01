export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized: Access denied for this resource or operation', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthenticated: Valid credentials or active session required', details?: any) {
    super(message, 401, 'UNAUTHENTICATED', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed for input data', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with identifier '${id}' was not found` : `${resource} was not found`;
    super(message, 404, 'NOT_FOUND', { resource, id });
  }
}

export class TenantIsolationError extends AppError {
  constructor(message: string = 'Cross-tenant access violation', details?: any) {
    super(message, 403, 'TENANT_ISOLATION_VIOLATION', details);
  }
}

export class FinancialIntegrityError extends AppError {
  constructor(message: string = 'Financial integrity violation or invalid accounting operation', details?: any) {
    super(message, 400, 'FINANCIAL_INTEGRITY_ERROR', details);
  }
}
