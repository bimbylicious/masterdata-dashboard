import { Employee, EmployeeSummary, UserRole } from '../types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../types/filter.types.js';
export declare class EmployeeService {
    private model;
    private excelService;
    constructor();
    getAllEmployees(userRole: UserRole, filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]>;
    getEmployeeById(empcode: string, userRole: UserRole): Promise<Employee | null>;
    searchEmployees(query: string): Promise<EmployeeSummary[]>;
    createEmployee(data: Omit<Employee, 'createdAt' | 'updatedAt'>): Promise<Employee>;
    updateEmployee(empcode: string, data: Partial<Employee>): Promise<Employee>;
    deleteEmployee(empcode: string): Promise<boolean>;
    importFromExcel(buffer: Buffer): Promise<import("../types/excel.types.js").ExcelImportResult | {
        success: boolean;
        totalRows: number;
        importedRows: number;
        skippedRows: number;
        duplicates: string[];
        errors: never[];
    }>;
    exportToExcel(): Promise<Buffer>;
    updateFromExcel(buffer: Buffer): Promise<import("../types/excel.types.js").ExcelImportResult | {
        success: boolean;
        totalRows: number;
        updatedRows: number;
        insertedRows: number;
        skippedRows: number;
        errors: never[];
    }>;
}
