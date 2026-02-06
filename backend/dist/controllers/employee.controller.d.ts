import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare class EmployeeController {
    private service;
    constructor();
    private getString;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    deleteEmployee(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadExcel(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateExcel(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadExcel(req: AuthRequest, res: Response): Promise<void>;
}
