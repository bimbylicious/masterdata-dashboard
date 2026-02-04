import { Employee } from './employee.types';

export interface EmployeeFilters {
  search?: string;
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