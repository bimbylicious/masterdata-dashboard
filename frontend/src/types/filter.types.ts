import { Employee } from './employee.types';

export interface EmployeeFilters {
  search?: string;
  rank?: string;
  empStatus?: string;
  position?: string;
  projName?: string;
  cbeNoncbe?: string;
  costcode?: string;
  status?: 'active' | 'inactive';
}

export interface SortConfig {
  field: keyof Employee;
  direction: 'asc' | 'desc';
}