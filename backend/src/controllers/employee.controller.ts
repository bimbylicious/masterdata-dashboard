import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { EmployeeService } from '../services/employee.service.js';

export class EmployeeController {
  private service: EmployeeService;

  constructor() {
    this.service = new EmployeeService();
  }

  // Helper to safely get string from query param
  private getString(value: any): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value as string | undefined;
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const filters = {
        search: this.getString(req.query.search),
        year: req.query.year ? Number(this.getString(req.query.year)) : undefined,
        projectDepartment: this.getString(req.query.projectDepartment),
        region: this.getString(req.query.region),
        sector: this.getString(req.query.sector),
        rank: this.getString(req.query.rank),
        employmentStatus: this.getString(req.query.employmentStatus) as any,
        status: this.getString(req.query.status) as any
      };

      const sortBy = this.getString(req.query.sortBy);
      const sortOrder = this.getString(req.query.sortOrder);
      const sort = sortBy ? { field: sortBy as any, direction: (sortOrder as any) || 'asc' } : undefined;

      const data = await this.service.getAllEmployees(req.user!.role, filters, sort);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('❌ Error in getAll:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await this.service.getEmployeeById(this.getString(req.params.id)!, req.user!.role);
      if (!data) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
      }
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('❌ Error in getById:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const data = await this.service.createEmployee(req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('❌ Error in create:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const data = await this.service.updateEmployee(this.getString(req.params.id)!, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('❌ Error in update:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  async deleteEmployee(req: AuthRequest, res: Response) {
    try {
      const success = await this.service.deleteEmployee(this.getString(req.params.id)!);
      if (!success) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Error in deleteEmployee:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  async uploadExcel(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      }
      console.log(`📤 Uploading Excel file: ${req.file.originalname} (${req.file.size} bytes)`);
      const result = await this.service.importFromExcel(req.file.buffer);
      console.log('✅ Excel import completed successfully');
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('❌ Error in uploadExcel:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: { 
          code: 'IMPORT_ERROR', 
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } 
      });
    }
  }

  async updateExcel(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      }
      console.log(`🔄 Updating database from Excel file: ${req.file.originalname} (${req.file.size} bytes)`);
      const result = await this.service.updateFromExcel(req.file.buffer);
      console.log('✅ Excel update completed successfully');
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('❌ Error in updateExcel:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: { 
          code: 'UPDATE_ERROR', 
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        } 
      });
    }
  }

  async downloadExcel(req: AuthRequest, res: Response) {
    try {
      const buffer = await this.service.exportToExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
      res.send(buffer);
    } catch (error: any) {
      console.error('❌ Error in downloadExcel:', error);
      res.status(500).json({ success: false, error: { code: 'EXPORT_ERROR', message: error.message } });
    }
  }
}