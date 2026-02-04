import { Employee, EmployeeSummary } from '../src/types/employee.types.backend.js';
import { EmployeeFilters, SortConfig } from '../src/types/filter.types.js';

export class EmployeeModel {
  private employees: Employee[] = [];

  async findAll(filters?: EmployeeFilters, sort?: SortConfig): Promise<EmployeeSummary[]> {
    let results = [...this.employees];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(emp =>
          emp.fullName.toLowerCase().includes(q) ||
          emp.idNumber.toLowerCase().includes(q) ||
          emp.position.toLowerCase().includes(q)
        );
      }
      if (filters.region)               results = results.filter(e => e.region === filters.region);
      if (filters.sector)               results = results.filter(e => e.sector === filters.sector);
      if (filters.employmentStatus)     results = results.filter(e => e.employmentStatus === filters.employmentStatus);
      if (filters.rank)                 results = results.filter(e => e.rank === filters.rank);
      if (filters.projectDepartment)    results = results.filter(e => e.projectDepartment === filters.projectDepartment);
      if (filters.monthCleared)         results = results.filter(e => e.monthCleared === filters.monthCleared);
      if (filters.position)             results = results.filter(e => e.position === filters.position);
      if (filters.status)               results = results.filter(e => e.status === filters.status);
    }

    if (sort) {
      results.sort((a, b) => {
        const aVal = String(a[sort.field as keyof typeof a] ?? '').toLowerCase();
        const bVal = String(b[sort.field as keyof typeof b] ?? '').toLowerCase();
        const dir = sort.direction === 'asc' ? 1 : -1;
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
        return 0;
      });
    }

    // Return summary with ALL fields needed for client-side filtering
    return results.map(emp => ({
      id: emp.id,
      idNumber: emp.idNumber,
      fullName: emp.fullName,
      position: emp.position,
      projectDepartment: emp.projectDepartment,
      region: emp.region,
      sector: emp.sector,
      rank: emp.rank,
      employmentStatus: emp.employmentStatus,
      monthCleared: emp.monthCleared,
      status: emp.status
    }));
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employees.find(emp => emp.id === id) || null;
  }

  async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const employee: Employee = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.push(employee);
    return employee;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    this.employees[index] = { ...this.employees[index], ...data, updatedAt: new Date() };
    return this.employees[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return false;
    this.employees.splice(index, 1);
    return true;
  }

  async bulkCreate(employees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Employee[]> {
    const created = employees.map((emp, i) => ({
      ...emp,
      id: Date.now().toString() + i.toString() + Math.random().toString(36).slice(2),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    this.employees.push(...created);
    return created;
  }

  async search(query: string): Promise<EmployeeSummary[]> {
    return this.findAll({ search: query });
  }
}