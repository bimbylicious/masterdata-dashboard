import { pool } from '../db/connection.js';
import { Employee, EmployeeSummary } from '../types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../types/filter.types.js';

export class EmployeeModel {
  async findAll(filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]> {
    let query = `
      SELECT 
        id, id_number, full_name, position, project_department, 
        region, sector, rank, employment_status, month_cleared, status
      FROM employees
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (filters?.search) {
      query += ` AND (
        LOWER(full_name) LIKE $${paramIndex} OR 
        LOWER(id_number) LIKE $${paramIndex} OR 
        LOWER(position) LIKE $${paramIndex}
      )`;
      params.push(`%${filters.search.toLowerCase()}%`);
      paramIndex++;
    }

    if (filters?.year) {
      query += ` AND year = $${paramIndex}`;
      params.push(filters.year);
      paramIndex++;
    }

    if (filters?.region) {
      query += ` AND region = $${paramIndex}`;
      params.push(filters.region);
      paramIndex++;
    }

    if (filters?.sector) {
      query += ` AND sector = $${paramIndex}`;
      params.push(filters.sector);
      paramIndex++;
    }

    if (filters?.rank) {
      query += ` AND rank = $${paramIndex}`;
      params.push(filters.rank);
      paramIndex++;
    }

    if (filters?.employmentStatus) {
      query += ` AND employment_status = $${paramIndex}`;
      params.push(filters.employmentStatus);
      paramIndex++;
    }

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.monthCleared) {
      query += ` AND month_cleared = $${paramIndex}`;
      params.push(filters.monthCleared);
      paramIndex++;
    }

    if (filters?.position) {
      query += ` AND position = $${paramIndex}`;
      params.push(filters.position);
      paramIndex++;
    }

    if (filters?.projectDepartment) {
      query += ` AND project_department = $${paramIndex}`;
      params.push(filters.projectDepartment);
      paramIndex++;
    }

    // Apply sorting
    if (sort) {
      const direction = sort.direction === 'asc' ? 'ASC' : 'DESC';
      const field = this.toSnakeCase(sort.field);
      query += ` ORDER BY ${field} ${direction}`;
    } else {
      query += ` ORDER BY created_at ASC, id ASC`;
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => this.rowToSummary(row));
  }

  async findById(id: string): Promise<Employee | null> {
    const result = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToEmployee(result.rows[0]);
  }

  async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    
    const result = await pool.query(
      `INSERT INTO employees (
        id, no, year, month_cleared, id_number, last_name, first_name, 
        middle_name, position, project_department, region, sector, rank,
        employment_status, effective_date_of_resignation, full_name, role, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        id, data.no, data.year, data.monthCleared, data.idNumber,
        data.lastName, data.firstName, data.middleName, data.position,
        data.projectDepartment, data.region, data.sector, data.rank,
        data.employmentStatus, data.effectiveDateOfResignation,
        data.fullName, data.role, data.status
      ]
    );

    return this.rowToEmployee(result.rows[0]);
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE employees 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Employee not found');
    }

    return this.rowToEmployee(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * 📥 IMPORT: REPLACE ALL DATA
   * 1. Check for duplicates WITHIN Excel file only
   * 2. Delete ALL existing data from database
   * 3. Insert all unique records from Excel
   */
  async bulkCreate(employees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ 
    created: Employee[], 
    skipped: string[], 
    duplicates: Array<{ idNumber: string; fullName: string }> 
  }> {
    const created: Employee[] = [];
    const skipped: string[] = [];
    const duplicates: Array<{ idNumber: string; fullName: string }> = [];
    
    console.log(`\n📥 IMPORT MODE - REPLACE ALL DATA`);
    console.log(`⚠️  This will DELETE all existing employees and replace with Excel data`);
    
    // Step 1: Check for duplicates WITHIN Excel only
    const idNumberMap = new Map<string, number>();
    const internalDuplicates: Array<{ idNumber: string; fullName: string }> = [];
    
    employees.forEach((emp, index) => {
      if (idNumberMap.has(emp.idNumber)) {
        internalDuplicates.push({ idNumber: emp.idNumber, fullName: emp.fullName });
      } else {
        idNumberMap.set(emp.idNumber, index);
      }
    });
    
    // Keep only first occurrence of each ID
    const uniqueEmployees = employees.filter((emp, index) => {
      return idNumberMap.get(emp.idNumber) === index;
    });
    
    console.log(`📊 Excel File Analysis:`);
    console.log(`   📄 Total rows in Excel: ${employees.length}`);
    console.log(`   🔍 Unique ID numbers: ${uniqueEmployees.length}`);
    if (internalDuplicates.length > 0) {
      console.log(`   ⚠️  Duplicate IDs in Excel (will keep first): ${internalDuplicates.length}`);
      internalDuplicates.slice(0, 5).forEach(dup => {
        console.log(`      - ${dup.idNumber} (${dup.fullName})`);
      });
      if (internalDuplicates.length > 5) {
        console.log(`      ... and ${internalDuplicates.length - 5} more`);
      }
    }
    
    // Step 2: DELETE ALL existing data
    try {
      const deleteResult = await pool.query('SELECT COUNT(*) FROM employees');
      const oldCount = parseInt(deleteResult.rows[0].count);
      
      console.log(`\n🗑️  Deleting ${oldCount} existing employees from database...`);
      await pool.query('DELETE FROM employees');
      console.log(`✅ Database cleared`);
      
      // Step 3: Insert all unique employees from Excel
      console.log(`\n💾 Inserting ${uniqueEmployees.length} employees from Excel...`);
      
      for (let i = 0; i < uniqueEmployees.length; i++) {
        const emp = uniqueEmployees[i];
        const id = Date.now().toString() + i.toString() + Math.random().toString(36).slice(2);
        
        try {
          const result = await pool.query(
            `INSERT INTO employees (
              id, no, year, month_cleared, id_number, last_name, first_name,
              middle_name, position, project_department, region, sector, rank,
              employment_status, effective_date_of_resignation, full_name, role, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [
              id, emp.no, emp.year, emp.monthCleared, emp.idNumber,
              emp.lastName, emp.firstName, emp.middleName, emp.position,
              emp.projectDepartment, emp.region, emp.sector, emp.rank,
              emp.employmentStatus, emp.effectiveDateOfResignation,
              emp.fullName, emp.role, emp.status
            ]
          );

          created.push(this.rowToEmployee(result.rows[0]));

          if (created.length % 50 === 0) {
            console.log(`   ⏳ Progress: ${created.length}/${uniqueEmployees.length} inserted...`);
          }
        } catch (error: any) {
          console.error(`❌ Error inserting ${emp.idNumber} (${emp.fullName}):`, error.message);
          skipped.push(emp.idNumber);
        }
      }

      // Add internal duplicates to the duplicates list for reporting
      internalDuplicates.forEach(dup => {
        duplicates.push(dup);
        skipped.push(dup.idNumber);
      });

      console.log(`\n✅ Import Complete - Database Replaced:`);
      console.log(`   🗑️  Deleted: ${oldCount} old employees`);
      console.log(`   ✅ Inserted: ${created.length} new employees`);
      if (internalDuplicates.length > 0) {
        console.log(`   ⏭️  Skipped (Excel duplicates): ${internalDuplicates.length}`);
      }
      if (skipped.length - internalDuplicates.length > 0) {
        console.log(`   ❌ Errors: ${skipped.length - internalDuplicates.length}`);
      }

    } catch (error: any) {
      console.error('❌ IMPORT FAILED:', error.message);
      throw error;
    }

    return { created, skipped, duplicates };
  }

  /**
   * 🔄 UPDATE: SYNC DATABASE WITH EXCEL
   * 1. Check for duplicates WITHIN Excel file only
   * 2. Update existing records (match by ID number)
   * 3. Insert new records
   * 4. PRESERVE records in database that are not in Excel
   */
  async updateOrCreate(employees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ 
    updated: Employee[], 
    inserted: Employee[], 
    skipped: string[] 
  }> {
    const updated: Employee[] = [];
    const inserted: Employee[] = [];
    const skipped: string[] = [];
    
    console.log(`\n🔄 UPDATE MODE - SYNC WITH EXCEL`);
    console.log(`💾 Records in database but not in Excel will be PRESERVED`);
    
    // Step 1: Check for duplicates WITHIN Excel
    const idNumberMap = new Map<string, number>();
    const internalDuplicates = new Set<string>();
    
    employees.forEach((emp, index) => {
      if (idNumberMap.has(emp.idNumber)) {
        internalDuplicates.add(emp.idNumber);
      } else {
        idNumberMap.set(emp.idNumber, index);
      }
    });
    
    const uniqueEmployees = employees.filter((emp, index) => {
      return idNumberMap.get(emp.idNumber) === index;
    });
    
    if (internalDuplicates.size > 0) {
      console.log(`⚠️  Found ${internalDuplicates.size} duplicate IDs in Excel (keeping first occurrence)`);
    }
    
    console.log(`📊 Processing ${uniqueEmployees.length} unique records from Excel...`);
    
    // Step 2: Update or Insert each unique employee
    for (let i = 0; i < uniqueEmployees.length; i++) {
      const emp = uniqueEmployees[i];
      
      try {
        // Check if employee exists in database
        const existing = await pool.query(
          'SELECT id FROM employees WHERE id_number = $1',
          [emp.idNumber]
        );

        if (existing.rows.length > 0) {
          // UPDATE existing employee
          const existingId = existing.rows[0].id;
          
          const result = await pool.query(
            `UPDATE employees SET
              no = $1, year = $2, month_cleared = $3,
              last_name = $4, first_name = $5, middle_name = $6,
              position = $7, project_department = $8, region = $9,
              sector = $10, rank = $11, employment_status = $12,
              effective_date_of_resignation = $13, full_name = $14,
              status = $15, updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
            RETURNING *`,
            [
              emp.no, emp.year, emp.monthCleared,
              emp.lastName, emp.firstName, emp.middleName,
              emp.position, emp.projectDepartment, emp.region,
              emp.sector, emp.rank, emp.employmentStatus,
              emp.effectiveDateOfResignation, emp.fullName, emp.status,
              existingId
            ]
          );

          updated.push(this.rowToEmployee(result.rows[0]));
          
          if (updated.length % 20 === 0) {
            console.log(`   🔄 Updated: ${updated.length}...`);
          }
        } else {
          // INSERT new employee
          const id = Date.now().toString() + i.toString() + Math.random().toString(36).slice(2);
          
          const result = await pool.query(
            `INSERT INTO employees (
              id, no, year, month_cleared, id_number, last_name, first_name,
              middle_name, position, project_department, region, sector, rank,
              employment_status, effective_date_of_resignation, full_name, role, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [
              id, emp.no, emp.year, emp.monthCleared, emp.idNumber,
              emp.lastName, emp.firstName, emp.middleName, emp.position,
              emp.projectDepartment, emp.region, emp.sector, emp.rank,
              emp.employmentStatus, emp.effectiveDateOfResignation,
              emp.fullName, emp.role, emp.status
            ]
          );

          inserted.push(this.rowToEmployee(result.rows[0]));
          
          if (inserted.length % 20 === 0) {
            console.log(`   ➕ Inserted: ${inserted.length}...`);
          }
        }

      } catch (error: any) {
        console.error(`❌ Error processing ${emp.idNumber} (${emp.fullName}):`, error.message);
        skipped.push(emp.idNumber);
      }
    }

    // Get total count in database after update
    const totalResult = await pool.query('SELECT COUNT(*) FROM employees');
    const totalInDb = parseInt(totalResult.rows[0].count);

    console.log(`\n✅ Update Complete - Database Synced:`);
    console.log(`   🔄 Updated: ${updated.length} existing employees`);
    console.log(`   ➕ Inserted: ${inserted.length} new employees`);
    if (skipped.length > 0) {
      console.log(`   ❌ Errors: ${skipped.length}`);
    }
    console.log(`   💾 Total in database: ${totalInDb} employees`);
    console.log(`   ℹ️  Records not in Excel: ${totalInDb - updated.length - inserted.length} (preserved)`);

    return { updated, inserted, skipped };
  }

  async search(query: string): Promise<EmployeeSummary[]> {
    return this.findAll({ search: query });
  }

  private rowToEmployee(row: any): Employee {
    return {
      id: row.id,
      no: row.no,
      year: row.year,
      monthCleared: row.month_cleared,
      idNumber: row.id_number,
      lastName: row.last_name,
      firstName: row.first_name,
      middleName: row.middle_name,
      position: row.position,
      projectDepartment: row.project_department,
      region: row.region,
      sector: row.sector,
      rank: row.rank,
      employmentStatus: row.employment_status,
      effectiveDateOfResignation: row.effective_date_of_resignation,
      fullName: row.full_name,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private rowToSummary(row: any): EmployeeSummary {
    return {
      id: row.id,
      idNumber: row.id_number,
      fullName: row.full_name,
      position: row.position,
      projectDepartment: row.project_department,
      region: row.region,
      sector: row.sector,
      rank: row.rank,
      employmentStatus: row.employment_status,
      monthCleared: row.month_cleared,
      status: row.status
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}