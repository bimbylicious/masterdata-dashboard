import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { PDFService } from '../services/pdf.service.js';
import { EmployeeService } from '../services/employee.service.js';

export class ClearanceController {
  private pdfService: PDFService;
  private employeeService: EmployeeService;

  constructor() {
    this.pdfService = new PDFService();
    this.employeeService = new EmployeeService();
  }

  async generateClearanceForm(req: AuthRequest, res: Response) {
    try {
      const empcode = Array.isArray(req.params.empcode) 
        ? req.params.empcode[0] 
        : req.params.empcode;
      
      const typeParam = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
      const clearanceType = typeParam as 'project-hire' | 'contractual';

      if (!clearanceType || !['project-hire', 'contractual'].includes(clearanceType)) {
        return res.status(400).json({
          success: false,
          error: { 
            code: 'INVALID_TYPE', 
            message: 'Clearance type must be either "project-hire" or "contractual"' 
          }
        });
      }

      console.log(`📄 Generating ${clearanceType} clearance form for employee: ${empcode}`);

      const employee = await this.employeeService.getEmployeeById(empcode, req.user!.role);

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Employee not found' }
        });
      }

      const pdfBuffer = await this.pdfService.fillClearanceForm({
        employeeName: employee.fullName,
        position: employee.position,
        department: employee.projName,
        clearanceType: clearanceType
      });

      const filename = `Clearance_Form_${employee.lastName}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);

      console.log(`✅ Clearance form generated: ${filename}`);

    } catch (error: any) {
      console.error('❌ Error in generateClearanceForm:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PDF_GENERATION_ERROR',
          message: error.message
        }
      });
    }
  }
}