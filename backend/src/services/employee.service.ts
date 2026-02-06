import { EmployeeModel } from '../models/employee.model.js';
import { ExcelService } from './excel.service.js';
import { Employee, EmployeeSummary, UserRole } from '../types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../types/filter.types.js';
import { ExcelEmployeeRow } from '../types/excel.types.js';

export class EmployeeService {
  private model: EmployeeModel;
  private excelService: ExcelService;

  constructor() {
    this.model = new EmployeeModel();
    this.excelService = new ExcelService();
  }

  async getAllEmployees(userRole: UserRole, filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]> {
    return await this.model.findAll(filters, sort);
  }

  async getEmployeeById(empcode: string, userRole: UserRole): Promise<Employee | null> {
    return await this.model.findById(empcode);
  }

  async searchEmployees(query: string): Promise<EmployeeSummary[]> {
    return await this.model.search(query);
  }

  async createEmployee(data: Omit<Employee, 'createdAt' | 'updatedAt'>): Promise<Employee> {
    return await this.model.create(data);
  }

  async updateEmployee(empcode: string, data: Partial<Employee>): Promise<Employee> {
    return await this.model.update(empcode, data);
  }

  async deleteEmployee(empcode: string): Promise<boolean> {
    return await this.model.delete(empcode);
  }

  async importFromExcel(buffer: Buffer) {
    try {
      console.log('📥 Starting Excel import...');
      
      const rows = this.excelService.parseExcelFile(buffer);
      console.log(`📊 Parsed ${rows.length} rows from Excel`);
      
      const validation = this.excelService.validateRows(rows);
      console.log('✅ Validation result:', validation);

      if (!validation.success) {
        console.log('❌ Validation failed:', validation.errors);
        return validation;
      }

      const employees = rows.map((row: ExcelEmployeeRow) =>
        this.excelService.transformExcelRowToEmployee(row)
      );
      console.log(`🔄 Transformed ${employees.length} employees`);

      console.log('💾 Starting bulk insert into database...');
      const result = await this.model.bulkCreate(employees);
      
      console.log(`✅ Successfully processed import!`);
      
      return {
        success: true,
        totalRows: rows.length,
        importedRows: result.created.length,
        skippedRows: result.skipped,
        duplicates: result.duplicates,
        errors: []
      };
    } catch (error: any) {
      console.error('❌ IMPORT ERROR:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Excel import failed: ${error.message}`);
    }
  }

  async exportToExcel(): Promise<Buffer> {
    try {
      const summaries = await this.model.findAll();
      const fullEmployees = await Promise.all(
        summaries.map((summary: EmployeeSummary) => this.model.findById(summary.empcode))
      );
      return this.excelService.exportToExcel(
        fullEmployees.filter((emp): emp is Employee => emp !== null)
      );
    } catch (error: any) {
      console.error('❌ EXPORT ERROR:', error);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }

  async updateFromExcel(buffer: Buffer) {
    try {
      console.log('🔄 Starting Excel update/sync...');
      
      const rows = this.excelService.parseExcelFile(buffer);
      console.log(`📊 Parsed ${rows.length} rows from Excel`);
      
      const validation = this.excelService.validateRows(rows);
      console.log('✅ Validation result:', validation);

      if (!validation.success) {
        console.log('❌ Validation failed:', validation.errors);
        return validation;
      }

      const employees = rows.map((row: ExcelEmployeeRow) =>
        this.excelService.transformExcelRowToEmployee(row)
      );
      console.log(`🔄 Transformed ${employees.length} employees`);

      console.log('💾 Starting update/insert into database...');
      const result = await this.model.updateOrCreate(employees);
      
      console.log(`✅ Successfully processed update!`);
      
      return {
        success: true,
        totalRows: rows.length,
        updatedRows: result.updated.length,
        insertedRows: result.inserted.length,
        skippedRows: result.skipped,
        errors: []
      };
    } catch (error: any) {
      console.error('❌ UPDATE ERROR:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Excel update failed: ${error.message}`);
    }
  }
}