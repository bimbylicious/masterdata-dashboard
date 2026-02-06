export interface Employee {
  // Primary Key
  empcode: string;
  
  // Employee Name Fields
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  
  // Employee Classification
  cbeNoncbe?: string;  // Y/N for CBE or NonCBE
  rank: string;
  empStatus: string;
  position: string;
  
  // Project/Assignment Information
  costcode?: string;
  projName: string;
  projHr?: string;
  
  // Contact Information
  emailAddress?: string;
  mobileAssignment?: string;
  mobileNumber?: string;
  
  // Asset Assignment
  laptopAssignment?: string;
  assetCode?: string;
  others?: string;
  remarks?: string;
  
  // System fields
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