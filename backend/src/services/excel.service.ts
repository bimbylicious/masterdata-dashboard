import * as XLSX from 'xlsx';
import { Employee } from '../types/employee.types.backend.js';
import { ExcelEmployeeRow, ExcelValidationRule, ExcelImportResult, ExcelError } from '../types/excel.types.js';

export class ExcelService {
  private validationRules: ExcelValidationRule[] = [
    { column: 'EMPCODE',           required: true,  type: 'string' },
    { column: 'FIRST NAME',        required: true,  type: 'string' },
    { column: 'LAST NAME',         required: true,  type: 'string' },
    { column: 'RANK',              required: true,  type: 'string' },
    { column: 'EMP STATUS',        required: true,  type: 'string' },
    { column: 'POSITION',          required: true,  type: 'string' },
    { column: 'PROJ NAME',         required: true,  type: 'string' }
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

        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            row: index + 2,
            column: rule.column,
            value,
            message: `${rule.column} is required`
          });
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

  transformExcelRowToEmployee(row: ExcelEmployeeRow): Omit<Employee, 'createdAt' | 'updatedAt'> {
    const safeString = (value: any): string => {
      if (value === null || value === undefined || value === '') return '';
      return String(value).trim();
    };

    // Clean EMPCODE - remove quotes, tabs, spaces, line breaks
    const empcode = String(row.EMPCODE || '')
      .replace(/["\s\r\n\t]/g, '')
      .trim();

    // Build full name
    const nameParts = [
      safeString(row['FIRST NAME']),
      safeString(row['MIDDLE NAME']),
      safeString(row['LAST NAME'])
    ].filter(Boolean);
    
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : 'Unknown';

    // Determine status from EMP STATUS
    const empStatus = safeString(row['EMP STATUS']);
    const inactiveStatuses = ['Resigned', 'Terminated', 'End of Contract'];
    const status = inactiveStatuses.includes(empStatus) ? 'inactive' : 'active';

    return {
      empcode: empcode || 'UNKNOWN',
      firstName: safeString(row['FIRST NAME']) || 'Unknown',
      middleName: safeString(row['MIDDLE NAME']) || undefined,
      lastName: safeString(row['LAST NAME']) || 'Unknown',
      fullName,
      cbeNoncbe: safeString(row['CBE/NonCBE']) || undefined,
      rank: safeString(row.RANK) || 'Not Specified',
      empStatus: empStatus || 'Unknown',
      position: safeString(row.POSITION) || 'Not Specified',
      costcode: safeString(row.COSTCODE) || undefined,
      projName: safeString(row['PROJ NAME']) || 'Not Specified',
      projHr: safeString(row['PROJ HR']) || undefined,
      emailAddress: safeString(row['EMAIL ADDRESS']) || undefined,
      mobileAssignment: safeString(row['MOBILE ASSIGNMENT']) || undefined,
      mobileNumber: safeString(row['MOBILE NUMBER']) || undefined,
      laptopAssignment: safeString(row['LAPTOP ASSIGNMENT']) || undefined,
      assetCode: safeString(row['ASSET CODE']) || undefined,
      others: safeString(row['OTHERS\n(Specify items assigned)']) || undefined,
      remarks: safeString(row.REMARKS) || undefined,
      role: 'employee',
      status
    };
  }

  exportToExcel(employees: Employee[]): Buffer {
    try {
      console.log(`📤 Exporting ${employees.length} employees to Excel...`);
      
      const safeValue = (value: any): string | number => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') return value;
        return String(value);
      };

      const excelData = employees.map(emp => ({
        'EMPCODE': safeValue(emp.empcode),
        'FIRST NAME': safeValue(emp.firstName),
        'MIDDLE NAME': safeValue(emp.middleName),
        'LAST NAME': safeValue(emp.lastName),
        'CBE/NonCBE': safeValue(emp.cbeNoncbe),
        'RANK': safeValue(emp.rank),
        'EMP STATUS': safeValue(emp.empStatus),
        'POSITION': safeValue(emp.position),
        'COSTCODE': safeValue(emp.costcode),
        'PROJ NAME': safeValue(emp.projName),
        'PROJ HR': safeValue(emp.projHr),
        'EMAIL ADDRESS': safeValue(emp.emailAddress),
        'MOBILE ASSIGNMENT': safeValue(emp.mobileAssignment),
        'MOBILE NUMBER': safeValue(emp.mobileNumber),
        'LAPTOP ASSIGNMENT': safeValue(emp.laptopAssignment),
        'ASSET CODE': safeValue(emp.assetCode),
        'OTHERS\n(Specify items assigned)': safeValue(emp.others),
        'REMARKS': safeValue(emp.remarks)
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 10 },  // EMPCODE
        { wch: 15 },  // FIRST NAME
        { wch: 15 },  // MIDDLE NAME
        { wch: 15 },  // LAST NAME
        { wch: 12 },  // CBE/NonCBE
        { wch: 20 },  // RANK
        { wch: 15 },  // EMP STATUS
        { wch: 30 },  // POSITION
        { wch: 12 },  // COSTCODE
        { wch: 50 },  // PROJ NAME
        { wch: 25 },  // PROJ HR
        { wch: 30 },  // EMAIL ADDRESS
        { wch: 18 },  // MOBILE ASSIGNMENT
        { wch: 15 },  // MOBILE NUMBER
        { wch: 18 },  // LAPTOP ASSIGNMENT
        { wch: 15 },  // ASSET CODE
        { wch: 30 },  // OTHERS
        { wch: 30 }   // REMARKS
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      
      const buffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx',
        compression: true
      });
      
      console.log(`✅ Excel file created successfully (${buffer.length} bytes)`);
      return buffer;
      
    } catch (error: any) {
      console.error('❌ Error creating Excel file:', error);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }
}