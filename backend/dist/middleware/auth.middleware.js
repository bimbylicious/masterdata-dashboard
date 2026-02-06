import { ROLE_PERMISSIONS } from '../types/auth.types.js';
export function hasPermission(resource, action) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }
        const permissions = ROLE_PERMISSIONS[userRole];
        const hasAccess = permissions.some((p) => p.resource === resource && p.actions.includes(action));
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
            });
        }
        next();
    };
}
export function authenticate(req, res, next) {
    req.user = {
        id: '1',
        role: 'admin'
    };
    next();
}
//# sourceMappingURL=auth.middleware.js.map