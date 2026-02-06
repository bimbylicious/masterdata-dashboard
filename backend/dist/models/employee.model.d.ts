import { Employee, EmployeeSummary } from '../types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../types/filter.types.js';
export declare class EmployeeModel {
    findAll(filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]>;
    findById(empcode: string): Promise<Employee | null>;
    create(data: Omit<Employee, 'createdAt' | 'updatedAt'>): Promise<Employee>;
    update(empcode: string, data: Partial<Employee>): Promise<Employee>;
    delete(empcode: string): Promise<boolean>;
    bulkCreate(employees: Omit<Employee, 'createdAt' | 'updatedAt'>[]): Promise<{
        created: Employee[];
        skipped: number;
        duplicates: string[];
    }>;
    updateOrCreate(employees: Omit<Employee, 'createdAt' | 'updatedAt'>[]): Promise<{
        updated: Employee[];
        inserted: Employee[];
        skipped: number;
    }>;
    search(query: string): Promise<EmployeeSummary[]>;
    private mapSortField;
    private mapRowToEmployee;
}
