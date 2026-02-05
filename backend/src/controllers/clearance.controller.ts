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

  /**
   * Generate a clearance form for a specific employee
   * GET /api/clearance/:employeeId?type=project-hire|contractual
   */
  async generateClearanceForm(req: AuthRequest, res: Response) {
    try {
      // Safely extract employeeId as string (fix TypeScript error)
      const employeeId = Array.isArray(req.params.employeeId) 
        ? req.params.employeeId[0] 
        : req.params.employeeId;
      
      // Safely extract clearance type from query params
      const typeParam = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
      const clearanceType = typeParam as 'project-hire' | 'contractual';

      // Validate clearance type
      if (!clearanceType || !['project-hire', 'contractual'].includes(clearanceType)) {
        return res.status(400).json({
          success: false,
          error: { 
            code: 'INVALID_TYPE', 
            message: 'Clearance type must be either "project-hire" or "contractual"' 
          }
        });
      }

      console.log(`📄 Generating ${clearanceType} clearance form for employee ID: ${employeeId}`);

      // Fetch employee data
      const employee = await this.employeeService.getEmployeeById(employeeId, req.user!.role);

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Employee not found' }
        });
      }

      // Generate the clearance PDF
      const pdfBuffer = await this.pdfService.fillClearanceForm({
        employeeName: employee.fullName,
        position: employee.position,
        department: employee.projectDepartment,
        clearanceType: clearanceType
      });

      // NEW: Filename is now "Clearance_Form_LastName.pdf"
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