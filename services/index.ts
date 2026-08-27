// Master barrel export for all domain services
export { default as apiClient } from './api-client';

// Domain packages
export * from './members';
export * from './finance';
export * from './attendance';
export * from './events';
export * from './groups';
export * from './departments';
export * from './sunday-school';
export * from './communications';
export * from './assets';
export * from './reports';
export * from './auth';
export * from './upload';

// Legacy department helpers compatibility
export {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './members-service';