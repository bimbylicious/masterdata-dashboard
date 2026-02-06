import { pool } from '../db/connection.js';
import { Employee, EmployeeSummary } from '../types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../types/filter.types.js';

export class EmployeeModel {
  async findAll(filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]> {
    try {
      let query = `
        SELECT 
          empcode, full_name as "fullName", position, proj_name as "projName",
          rank, emp_status as "empStatus", cbe_noncbe as "cbeNoncbe", status
        FROM employees
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      // Apply filters
      if (filters?.search) {
        query += ` AND (
          LOWER(full_name) LIKE $${paramCount} OR 
          LOWER(empcode) LIKE $${paramCount} OR 
          LOWER(position) LIKE $${paramCount} OR
          LOWER(proj_name) LIKE $${paramCount}
        )`;
        params.push(`%${filters.search.toLowerCase()}%`);
        paramCount++;
      }

      if (filters?.rank) {
        query += ` AND rank = $${paramCount}`;
        params.push(filters.rank);
        paramCount++;
      }

      if (filters?.empStatus) {
        query += ` AND emp_status = $${paramCount}`;
        params.push(filters.empStatus);
        paramCount++;
      }

      if (filters?.position) {
        query += ` AND position = $${paramCount}`;
        params.push(filters.position);
        paramCount++;
      }

      if (filters?.projName) {
        query += ` AND proj_name = $${paramCount}`;
        params.push(filters.projName);
        paramCount++;
      }

      if (filters?.cbeNoncbe) {
        query += ` AND cbe_noncbe = $${paramCount}`;
        params.push(filters.cbeNoncbe);
        paramCount++;
      }

      if (filters?.costcode) {
        query += ` AND costcode = $${paramCount}`;
        params.push(filters.costcode);
        paramCount++;
      }

      if (filters?.status) {
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      // Apply sorting
      if (sort) {
        const sortColumn = this.mapSortField(sort.field);
        query += ` ORDER BY ${sortColumn} ${sort.direction.toUpperCase()}`;
      } else {
        query += ` ORDER BY empcode ASC`;
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error: any) {
      console.error('❌ Error in findAll:', error);
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  }

  async findById(empcode: string): Promise<Employee | null> {
    try {
      const query = `
        SELECT 
          empcode, first_name as "firstName", middle_name as "middleName",
          last_name as "lastName", full_name as "fullName",
          cbe_noncbe as "cbeNoncbe", rank, emp_status as "empStatus",
          position, costcode, proj_name as "projName", proj_hr as "projHr",
          email_address as "emailAddress", mobile_assignment as "mobileAssignment",
          mobile_number as "mobileNumber", laptop_assignment as "laptopAssignment",
          asset_code as "assetCode", others, remarks,
          role, status, created_at as "createdAt", updated_at as "updatedAt"
        FROM employees
        WHERE empcode = $1
      `;
      const result = await pool.query(query, [empcode]);
      return result.rows[0] || null;
    } catch (error: any) {
      console.error('❌ Error in findById:', error);
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }
  }

  async create(data: Omit<Employee, 'createdAt' | 'updatedAt'>): Promise<Employee> {
    try {
      const query = `
        INSERT INTO employees (
          empcode, first_name, middle_name, last_name, full_name,
          cbe_noncbe, rank, emp_status, position, costcode, proj_name, proj_hr,
          email_address, mobile_assignment, mobile_number, laptop_assignment,
          asset_code, others, remarks, role, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *
      `;
      const values = [
        data.empcode, data.firstName, data.middleName, data.lastName, data.fullName,
        data.cbeNoncbe, data.rank, data.empStatus, data.position, data.costcode,
        data.projName, data.projHr, data.emailAddress, data.mobileAssignment,
        data.mobileNumber, data.laptopAssignment, data.assetCode, data.others,
        data.remarks, data.role, data.status
      ];
      const result = await pool.query(query, values);
      return this.mapRowToEmployee(result.rows[0]);
    } catch (error: any) {
      console.error('❌ Error in create:', error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  async update(empcode: string, data: Partial<Employee>): Promise<Employee> {
    try {
      // Build dynamic UPDATE query to handle null values properly
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      // Helper to add field updates
      const addUpdate = (field: string, dbColumn: string, value: any) => {
        if (value !== undefined) {
          updates.push(`${dbColumn} = $${paramCount}`);
          values.push(value === '' ? null : value); // Convert empty string to null
          paramCount++;
        }
      };

      // Add all fields that can be updated
      addUpdate('firstName', 'first_name', data.firstName);
      addUpdate('middleName', 'middle_name', data.middleName);
      addUpdate('lastName', 'last_name', data.lastName);
      addUpdate('fullName', 'full_name', data.fullName);
      addUpdate('cbeNoncbe', 'cbe_noncbe', data.cbeNoncbe);
      addUpdate('rank', 'rank', data.rank);
      addUpdate('empStatus', 'emp_status', data.empStatus);
      addUpdate('position', 'position', data.position);
      addUpdate('costcode', 'costcode', data.costcode);
      addUpdate('projName', 'proj_name', data.projName);
      addUpdate('projHr', 'proj_hr', data.projHr);
      addUpdate('emailAddress', 'email_address', data.emailAddress);
      addUpdate('mobileAssignment', 'mobile_assignment', data.mobileAssignment);
      addUpdate('mobileNumber', 'mobile_number', data.mobileNumber);
      addUpdate('laptopAssignment', 'laptop_assignment', data.laptopAssignment);
      addUpdate('assetCode', 'asset_code', data.assetCode);
      addUpdate('others', 'others', data.others);
      addUpdate('remarks', 'remarks', data.remarks);
      addUpdate('status', 'status', data.status);

      // Always update updated_at
      updates.push('updated_at = CURRENT_TIMESTAMP');

      // If no fields to update, return current employee
      if (updates.length === 1) { // Only updated_at
        return this.findById(empcode) as Promise<Employee>;
      }

      // Add empcode as last parameter
      values.push(empcode);

      const query = `
        UPDATE employees SET
          ${updates.join(', ')}
        WHERE empcode = $${paramCount}
        RETURNING *
      `;

      console.log('🔄 Update query:', query);
      console.log('📝 Update values:', values);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }
      
      return this.mapRowToEmployee(result.rows[0]);
    } catch (error: any) {
      console.error('❌ Error in update:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  async delete(empcode: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM employees WHERE empcode = $1';
      const result = await pool.query(query, [empcode]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error: any) {
      console.error('❌ Error in delete:', error);
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  async bulkCreate(employees: Omit<Employee, 'createdAt' | 'updatedAt'>[]): Promise<{
    created: Employee[];
    skipped: number;
    duplicates: string[];
  }> {
    const created: Employee[] = [];
    const duplicates: string[] = [];
    let skipped = 0;

    for (const emp of employees) {
      try {
        const existing = await pool.query(
          'SELECT empcode FROM employees WHERE empcode = $1',
          [emp.empcode]
        );

        if (existing.rows.length > 0) {
          duplicates.push(emp.empcode);
          skipped++;
          continue;
        }

        const newEmp = await this.create(emp);
        created.push(newEmp);
      } catch (error: any) {
        console.error(`❌ Error creating employee ${emp.empcode}:`, error.message);
        skipped++;
      }
    }

    return { created, skipped, duplicates };
  }

  async updateOrCreate(employees: Omit<Employee, 'createdAt' | 'updatedAt'>[]): Promise<{
    updated: Employee[];
    inserted: Employee[];
    skipped: number;
  }> {
    const updated: Employee[] = [];
    const inserted: Employee[] = [];
    let skipped = 0;

    for (const emp of employees) {
      try {
        const existing = await pool.query(
          'SELECT empcode FROM employees WHERE empcode = $1',
          [emp.empcode]
        );

        if (existing.rows.length > 0) {
          const updatedEmp = await this.update(existing.rows[0].empcode, emp);
          updated.push(updatedEmp);
        } else {
          const newEmp = await this.create(emp);
          inserted.push(newEmp);
        }
      } catch (error: any) {
        console.error(`❌ Error processing employee ${emp.empcode}:`, error.message);
        skipped++;
      }
    }

    return { updated, inserted, skipped };
  }

  async search(query: string): Promise<EmployeeSummary[]> {
    return this.findAll({ search: query });
  }

  private mapSortField(field: keyof Employee): string {
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      middleName: 'middle_name',
      lastName: 'last_name',
      fullName: 'full_name',
      cbeNoncbe: 'cbe_noncbe',
      empStatus: 'emp_status',
      projName: 'proj_name',
      projHr: 'proj_hr',
      emailAddress: 'email_address',
      mobileAssignment: 'mobile_assignment',
      mobileNumber: 'mobile_number',
      laptopAssignment: 'laptop_assignment',
      assetCode: 'asset_code',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    return fieldMap[field as string] || field;
  }

  private mapRowToEmployee(row: any): Employee {
    return {
      empcode: row.empcode,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      fullName: row.full_name,
      cbeNoncbe: row.cbe_noncbe,
      rank: row.rank,
      empStatus: row.emp_status,
      position: row.position,
      costcode: row.costcode,
      projName: row.proj_name,
      projHr: row.proj_hr,
      emailAddress: row.email_address,
      mobileAssignment: row.mobile_assignment,
      mobileNumber: row.mobile_number,
      laptopAssignment: row.laptop_assignment,
      assetCode: row.asset_code,
      others: row.others,
      remarks: row.remarks,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}