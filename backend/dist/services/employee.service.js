import { EmployeeModel } from '../models/employee.model.js';
import { ExcelService } from './excel.service.js';
export class EmployeeService {
    constructor() {
        this.model = new EmployeeModel();
        this.excelService = new ExcelService();
    }
    async getAllEmployees(userRole, filters, sort) {
        return await this.model.findAll(filters, sort);
    }
    async getEmployeeById(empcode, userRole) {
        return await this.model.findById(empcode);
    }
    async searchEmployees(query) {
        return await this.model.search(query);
    }
    async createEmployee(data) {
        return await this.model.create(data);
    }
    async updateEmployee(empcode, data) {
        return await this.model.update(empcode, data);
    }
    async deleteEmployee(empcode) {
        return await this.model.delete(empcode);
    }
    async importFromExcel(buffer) {
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
            const employees = rows.map((row) => this.excelService.transformExcelRowToEmployee(row));
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
        }
        catch (error) {
            console.error('❌ IMPORT ERROR:', error);
            console.error('Stack trace:', error.stack);
            throw new Error(`Excel import failed: ${error.message}`);
        }
    }
    async exportToExcel() {
        try {
            const summaries = await this.model.findAll();
            const fullEmployees = await Promise.all(summaries.map((summary) => this.model.findById(summary.empcode)));
            return this.excelService.exportToExcel(fullEmployees.filter((emp) => emp !== null));
        }
        catch (error) {
            console.error('❌ EXPORT ERROR:', error);
            throw new Error(`Excel export failed: ${error.message}`);
        }
    }
    async updateFromExcel(buffer) {
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
            const employees = rows.map((row) => this.excelService.transformExcelRowToEmployee(row));
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
        }
        catch (error) {
            console.error('❌ UPDATE ERROR:', error);
            console.error('Stack trace:', error.stack);
            throw new Error(`Excel update failed: ${error.message}`);
        }
    }
}
//# sourceMappingURL=employee.service.js.map