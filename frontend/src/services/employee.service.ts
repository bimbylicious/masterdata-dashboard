import { ApiService } from './api.service';
import { Employee, EmployeeSummary } from '../types/employee.types.js';
import { EmployeeFilters } from '../types/filter.types.js';

export class EmployeeService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async getAllEmployees(filters?: EmployeeFilters): Promise<EmployeeSummary[]> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    const endpoint = query ? `/employees?${query}` : '/employees';

    const response = await this.api.get<EmployeeSummary[]>(endpoint);
    return response.data || [];
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const response = await this.api.get<Employee>(`/employees/${id}`);
    return response.data || null;
  }

  async importExcel(file: File) {
    return await this.api.uploadFile('/employees/import', file);
  }

  async updateDatabase(file: File) {
    return await this.api.uploadFile('/employees/update', file);
  }

  async exportExcel(): Promise<void> {
    const blob = await this.api.downloadFile('/employees/export');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await this.api.put<Employee>(`/employees/${id}`, data);
    return response.data!;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const response = await this.api.delete(`/employees/${id}`);
    return response.success;
  }
}