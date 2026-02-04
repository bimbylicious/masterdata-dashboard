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
      // Convert camelCase to snake_case for database columns
      const field = this.toSnakeCase(sort.field);
      query += ` ORDER BY ${field} ${direction}`;
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

    // Convert snake_case to camelCase
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

    // Build SET clause dynamically
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

  async bulkCreate(employees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ created: Employee[], skipped: string[], duplicates: Array<{ idNumber: string; fullName: string }> }> {
    const created: Employee[] = [];
    const skipped: string[] = [];
    const duplicates: Array<{ idNumber: string; fullName: string }> = [];
    let successCount = 0;
    let skipCount = 0;
    
    // Process each employee individually (no transaction)
    // This way, if one fails, others can still succeed
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const id = Date.now().toString() + i.toString() + Math.random().toString(36).slice(2);
      
      try {
        // Insert without wrapping in a transaction
        // Each insert is autocommit
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
        successCount++;

        // Show progress for large imports
        if ((successCount + skipCount) % 50 === 0) {
          console.log(`   📍 Progress: ${successCount + skipCount}/${employees.length} processed...`);
        }
      } catch (error: any) {
        // Check if it's a duplicate key error
        if (error.code === '23505' && error.constraint === 'employees_id_number_key') {
          console.log(`⚠️  Skipping duplicate ID: ${emp.idNumber} (${emp.fullName})`);
          duplicates.push({ idNumber: emp.idNumber, fullName: emp.fullName });
          skipped.push(emp.idNumber);
          skipCount++;
        } else {
          // Log other errors but continue
          console.error(`❌ Error inserting ${emp.idNumber} (${emp.fullName}):`, error.message);
          skipCount++;
        }
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Created: ${created.length} employees`);
    console.log(`   ⚠️  Skipped: ${skipped.length} records`);
    if (duplicates.length > 0) {
      console.log(`   📋 Duplicate ID Numbers:`);
      duplicates.slice(0, 5).forEach(dup => {
        console.log(`      - ${dup.idNumber} (${dup.fullName})`);
      });
      if (duplicates.length > 5) {
        console.log(`      ... and ${duplicates.length - 5} more`);
      }
    }

    return { created, skipped, duplicates };
  }

  async search(query: string): Promise<EmployeeSummary[]> {
    return this.findAll({ search: query });
  }

  // Helper: Convert database row to Employee object
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

  // Helper: Convert database row to EmployeeSummary
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

  // Helper: Convert camelCase to snake_case
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}