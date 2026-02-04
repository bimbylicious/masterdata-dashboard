import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_PERMISSIONS, Action } from '../types/auth.types.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export function hasPermission(resource: string, action: Action) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const permissions = ROLE_PERMISSIONS[userRole];
    const hasAccess = permissions.some((p: { resource: string; actions: Action[] }) =>
      p.resource === resource && p.actions.includes(action)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  req.user = {
    id: '1',
    role: 'admin'
  };
  next();
}