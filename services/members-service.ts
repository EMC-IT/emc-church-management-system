export * from './members/members-service';
export { default } from './members/members-service';

// Legacy department helpers compatibility
import { Department } from '@/lib/types';
export async function getDepartments(): Promise<Department[]> {
  return [];
}
export async function getDepartmentById(id: string): Promise<Department | null> {
  return null;
}
export async function createDepartment(data: Partial<Department>): Promise<Department> {
  return {
    id: 'new',
    name: data.name || '',
    description: data.description || '',
    leader: data.leader || '',
    members: data.members || [],
    departmentType: data.departmentType,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
export async function updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    leader: data.leader || '',
    members: data.members || [],
    departmentType: data.departmentType,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
export async function deleteDepartment(id: string): Promise<void> {
  return;
}