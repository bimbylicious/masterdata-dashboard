import { Employee } from '../types/employee.types.backend.js';
import { ExcelEmployeeRow, ExcelImportResult } from '../types/excel.types.js';
export declare class ExcelService {
    private validationRules;
    parseExcelFile(buffer: Buffer): ExcelEmployeeRow[];
    validateRows(rows: ExcelEmployeeRow[]): ExcelImportResult;
    transformExcelRowToEmployee(row: ExcelEmployeeRow): Omit<Employee, 'createdAt' | 'updatedAt'>;
    exportToExcel(employees: Employee[]): Buffer;
}
