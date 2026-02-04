import { Employee } from './employee.types.backend.js';

export interface EmployeeFilters {
  search?: string;
  year?: number;
  monthCleared?: string;
  position?: string;
  projectDepartment?: string;
  region?: string;
  sector?: string;
  rank?: string;
  employmentStatus?: string;
  status?: 'active' | 'inactive';
}

export interface SortConfig {
  field: keyof Employee;
  direction: 'asc' | 'desc';
}