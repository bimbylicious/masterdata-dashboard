import { Request, Response, NextFunction } from 'express';
import { UserRole, Action } from '../types/auth.types.js';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}
export declare function hasPermission(resource: string, action: Action): (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
