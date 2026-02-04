import * as XLSX from 'xlsx';
import { Employee } from '../types/employee.types.backend.js';
import { ExcelEmployeeRow, ExcelValidationRule, ExcelImportResult, ExcelError } from '../types/excel.types.js';

export class ExcelService {
  // UPDATED: Only essential fields are required
  private validationRules: ExcelValidationRule[] = [
    { column: 'NO',                    required: false,  type: 'number' },
    { column: 'YEAR',                  required: false,  type: 'number' },
    { column: 'ID NUMBER',             required: false,  type: 'string' },
    { column: 'LAST NAME',             required: false,  type: 'string' },
    { column: 'FIRST NAME',            required: false,  type: 'string' },
    { column: 'MIDDLE NAME',           required: false, type: 'string' },
    { column: 'POSITION',              required: false, type: 'string' },
    { column: 'PROJECT/DEPARTMENT',    required: false, type: 'string' },
    { column: 'REGION',                required: false, type: 'string' },
    { column: 'SECTOR',                required: false, type: 'string' },
    { column: 'RANK',                  required: false, type: 'string' },
    { column: 'EMPLOYMENT STATUS',     required: false, type: 'string' }
  ];

  parseExcelFile(buffer: Buffer): ExcelEmployeeRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as ExcelEmployeeRow[];
    return data;
  }

  validateRows(rows: ExcelEmployeeRow[]): ExcelImportResult {
    const errors: ExcelError[] = [];

    rows.forEach((row, index) => {
      this.validationRules.forEach(rule => {
        const value = row[rule.column as keyof ExcelEmployeeRow];

        // Only validate if required
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            row: index + 2,
            column: rule.column,
            value,
            message: `${rule.column} is required`
          });
        }

        // Validate type for non-empty values
        if (value !== undefined && value !== null && value !== '' && rule.type === 'number') {
          let numValue: number;
          if (typeof value === 'string') {
            numValue = parseFloat(value);
          } else if (typeof value === 'number') {
            numValue = value;
          } else {
            numValue = NaN;
          }
          
          if (isNaN(numValue)) {
            errors.push({
              row: index + 2,
              column: rule.column,
              value,
              message: `${rule.column} must be a number`
            });
          }
        }
      });
    });

    return {
      success: errors.length === 0,
      totalRows: rows.length,
      importedRows: rows.length - errors.length,
      errors
    };
  }

  transformExcelRowToEmployee(row: ExcelEmployeeRow): Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {
    // Helper: safely convert to string
    const safeString = (value: any): string => {
      if (value === null || value === undefined || value === '') return '';
      return String(value).trim();
    };

    // Helper: safely convert to number
    const safeNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Clean ID number - remove quotes, tabs, spaces, line breaks
    const idNumber = String(row['ID NUMBER'] || '')
      .replace(/["\s\r\n\t]/g, '')
      .trim();

    // Build full name from available parts
    const nameParts = [
      safeString(row['FIRST NAME']),
      safeString(row['MIDDLE NAME']),
      safeString(row['LAST NAME'])
    ].filter(Boolean);
    
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : 'Unknown';

    // Determine status from employment status
    const employmentStatus = safeString(row['EMPLOYMENT STATUS']);
    const inactiveStatuses = ['Resigned', 'Terminated'];
    const status = inactiveStatuses.includes(employmentStatus) ? 'inactive' : 'active';

    return {
      no: safeNumber(row.NO),
      year: safeNumber(row.YEAR),
      monthCleared: safeString(row['MONTH CLEARED']) || undefined,
      idNumber: idNumber || 'UNKNOWN',
      lastName: safeString(row['LAST NAME']) || 'Unknown',
      firstName: safeString(row['FIRST NAME']) || 'Unknown',
      middleName: safeString(row['MIDDLE NAME']) || undefined,
      position: safeString(row.POSITION) || 'Not Specified',
      projectDepartment: safeString(row['PROJECT/DEPARTMENT']) || 'Not Specified',
      region: safeString(row.REGION) || 'Not Specified',
      sector: safeString(row.SECTOR) || 'Not Specified',
      rank: safeString(row.RANK) || 'Not Specified',
      employmentStatus: employmentStatus || 'Unknown',
      effectiveDateOfResignation: safeString(row['EFFECTIVE DATE OF RESIGNATION']) || undefined,
      fullName,
      role: 'employee',
      status
    };
  }

  exportToExcel(employees: Employee[]): Buffer {
    const excelData = employees.map(emp => ({
      'NO': emp.no,
      'YEAR': emp.year,
      'MONTH CLEARED': emp.monthCleared || '',
      'ID NUMBER': emp.idNumber,
      'LAST NAME': emp.lastName,
      'FIRST NAME': emp.firstName,
      'MIDDLE NAME': emp.middleName || '',
      'GENDER': '',
      'MARITAL STATUS': '',
      'POSITION': emp.position,
      'MT': '',
      'PROJECT/DEPARTMENT': emp.projectDepartment,
      'REGION': emp.region,
      'SECTOR': emp.sector,
      'RANK': emp.rank,
      'BIRTHDAY': '',
      'AGE (UPON RESIGNATION)': '',
      'EMPLOYMENT STATUS': emp.employmentStatus,
      'EFFECTIVE DATE OF RESIGNATION': emp.effectiveDateOfResignation || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 5 },   // NO
      { wch: 6 },   // YEAR
      { wch: 15 },  // MONTH CLEARED
      { wch: 12 },  // ID NUMBER
      { wch: 20 },  // LAST NAME
      { wch: 20 },  // FIRST NAME
      { wch: 20 },  // MIDDLE NAME
      { wch: 10 },  // GENDER
      { wch: 15 },  // MARITAL STATUS
      { wch: 30 },  // POSITION
      { wch: 5 },   // MT
      { wch: 30 },  // PROJECT/DEPARTMENT
      { wch: 15 },  // REGION
      { wch: 25 },  // SECTOR
      { wch: 15 },  // RANK
      { wch: 12 },  // BIRTHDAY
      { wch: 8 },   // AGE
      { wch: 20 },  // EMPLOYMENT STATUS
      { wch: 20 }   // EFFECTIVE DATE
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}