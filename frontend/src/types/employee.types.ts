export interface Employee {
  no: number;
  year: number;
  monthCleared?: string;
  idNumber: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  position: string;
  projectDepartment: string;
  region: string;
  sector: string;
  rank: string;
  employmentStatus: string;
  effectiveDateOfResignation?: string;

  id: string;
  fullName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'employee';

export interface EmployeeSummary {
  id: string;
  idNumber: string;
  fullName: string;
  position: string;
  projectDepartment: string;
  region: string;
  sector: string;
  rank: string;
  employmentStatus: string;
  monthCleared?: string;
  status: 'active' | 'inactive';
}