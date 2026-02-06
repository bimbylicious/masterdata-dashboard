export type UserRole = 'admin' | 'employee';
export interface User {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
}
export interface Permission {
    resource: string;
    actions: Action[];
}
export type Action = 'read' | 'write' | 'delete' | 'import' | 'export';
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
