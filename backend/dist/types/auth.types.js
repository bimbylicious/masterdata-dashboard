export const ROLE_PERMISSIONS = {
    admin: [
        { resource: 'employees', actions: ['read', 'write', 'delete', 'import', 'export'] }
    ],
    employee: [
        { resource: 'employees', actions: ['read'] }
    ]
};
//# sourceMappingURL=auth.types.js.map