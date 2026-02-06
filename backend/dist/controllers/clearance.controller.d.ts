import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare class ClearanceController {
    private pdfService;
    private employeeService;
    constructor();
    generateClearanceForm(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
