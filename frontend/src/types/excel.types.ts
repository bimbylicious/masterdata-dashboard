export interface ExcelEmployeeRow {
  NO: number;
  YEAR: number;
  'MONTH CLEARED'?: string;
  'ID NUMBER': string;
  'LAST NAME': string;
  'FIRST NAME': string;
  'MIDDLE NAME'?: string;
  POSITION: string;
  'PROJECT/DEPARTMENT': string;
  REGION: string;
  SECTOR: string;
  RANK: string;
  'EMPLOYMENT STATUS': string;
  'EFFECTIVE DATE OF RESIGNATION'?: string | Date;
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