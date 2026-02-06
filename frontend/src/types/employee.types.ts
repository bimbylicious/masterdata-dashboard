export interface Employee {
  empcode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  cbeNoncbe?: string;
  rank: string;
  empStatus: string;
  position: string;
  costcode?: string;
  projName: string;
  projHr?: string;
  emailAddress?: string;
  mobileAssignment?: string;
  mobileNumber?: string;
  laptopAssignment?: string;
  assetCode?: string;
  others?: string;
  remarks?: string;
  
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'employee';

export interface EmployeeSummary {
  empcode: string;
  fullName: string;
  position: string;
  projName: string;
  rank: string;
  empStatus: string;
  cbeNoncbe?: string;
  status: 'active' | 'inactive';
}