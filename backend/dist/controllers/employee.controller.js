import { EmployeeService } from '../services/employee.service.js';
export class EmployeeController {
    constructor() {
        this.service = new EmployeeService();
    }
    getString(value) {
        if (Array.isArray(value))
            return value[0];
        return value;
    }
    async getAll(req, res) {
        try {
            const filters = {
                search: this.getString(req.query.search),
                rank: this.getString(req.query.rank),
                empStatus: this.getString(req.query.empStatus),
                position: this.getString(req.query.position),
                projName: this.getString(req.query.projName),
                cbeNoncbe: this.getString(req.query.cbeNoncbe),
                costcode: this.getString(req.query.costcode),
                status: this.getString(req.query.status)
            };
            const sortBy = this.getString(req.query.sortBy);
            const sortOrder = this.getString(req.query.sortOrder);
            const sort = sortBy ? { field: sortBy, direction: sortOrder || 'asc' } : undefined;
            const data = await this.service.getAllEmployees(req.user.role, filters, sort);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('❌ Error in getAll:', error);
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
        }
    }
    async getById(req, res) {
        try {
            const empcode = this.getString(req.params.empcode);
            const data = await this.service.getEmployeeById(empcode, req.user.role);
            if (!data) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
            }
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('❌ Error in getById:', error);
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
        }
    }
    async create(req, res) {
        try {
            const data = await this.service.createEmployee(req.body);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('❌ Error in create:', error);
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
        }
    }
    async update(req, res) {
        try {
            const empcode = this.getString(req.params.empcode);
            const data = await this.service.updateEmployee(empcode, req.body);
            res.json({ success: true, data });
        }
        catch (error) {
            console.error('❌ Error in update:', error);
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
        }
    }
    async deleteEmployee(req, res) {
        try {
            const empcode = this.getString(req.params.empcode);
            const success = await this.service.deleteEmployee(empcode);
            if (!success) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
            }
            res.json({ success: true });
        }
        catch (error) {
            console.error('❌ Error in deleteEmployee:', error);
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
        }
    }
    async uploadExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
            }
            console.log(`📤 Uploading Excel file: ${req.file.originalname} (${req.file.size} bytes)`);
            const result = await this.service.importFromExcel(req.file.buffer);
            console.log('✅ Excel import completed successfully');
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('❌ Error in uploadExcel:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'IMPORT_ERROR',
                    message: error.message
                }
            });
        }
    }
    async updateExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
            }
            console.log(`🔄 Updating database from Excel file: ${req.file.originalname} (${req.file.size} bytes)`);
            const result = await this.service.updateFromExcel(req.file.buffer);
            console.log('✅ Excel update completed successfully');
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('❌ Error in updateExcel:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: error.message
                }
            });
        }
    }
    async downloadExcel(req, res) {
        try {
            const buffer = await this.service.exportToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
            res.send(buffer);
        }
        catch (error) {
            console.error('❌ Error in downloadExcel:', error);
            res.status(500).json({ success: false, error: { code: 'EXPORT_ERROR', message: error.message } });
        }
    }
}
//# sourceMappingURL=employee.controller.js.map