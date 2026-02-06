export interface ExcelEmployeeRow {
  EMPCODE: string;
  'FIRST NAME': string;
  'MIDDLE NAME'?: string;
  'LAST NAME': string;
  'CBE/NonCBE'?: string;
  RANK: string;
  'EMP STATUS': string;
  POSITION: string;
  COSTCODE?: string;
  'PROJ NAME': string;
  'PROJ HR'?: string;
  'EMAIL ADDRESS'?: string;
  'MOBILE ASSIGNMENT'?: string;
  'MOBILE NUMBER'?: string;
  'LAPTOP ASSIGNMENT'?: string;
  'ASSET CODE'?: string;
  'OTHERS\n(Specify items assigned)'?: string;
  REMARKS?: string;
}

export interface ExcelError {
  row: number;
  column: string;
  value: any;
  message: string;
}

export interface ExcelImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: ExcelError[];
}

export interface ExcelValidationRule {
  column: string;
  required: boolean;
  type: 'string' | 'number' | 'date';
  validator?: (value: any) => boolean;
}