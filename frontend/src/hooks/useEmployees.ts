import { useState, useEffect, useRef } from 'react';
import { EmployeeService } from '../services/employee.service';
import { EmployeeSummary, Employee } from '../types/employee.types';
import { EmployeeFilters } from '../types/filter.types';

export function useEmployees() {
  const [allEmployees, setAllEmployees] = useState<EmployeeSummary[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const serviceRef = useRef(new EmployeeService());

  const fetchAllEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceRef.current.getAllEmployees();
      setAllEmployees(data);
      applyFilters(data, filters);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (currentAll: EmployeeSummary[], currentFilters: EmployeeFilters) => {
    let result = [...currentAll];

    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(q) ||
        e.empcode.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.projName.toLowerCase().includes(q)
      );
    }

    if (currentFilters.rank) {
      result = result.filter(e => e.rank === currentFilters.rank);
    }

    if (currentFilters.empStatus) {
      result = result.filter(e => e.empStatus === currentFilters.empStatus);
    }

    if (currentFilters.position) {
      result = result.filter(e => e.position === currentFilters.position);
    }

    if (currentFilters.projName) {
      result = result.filter(e => e.projName === currentFilters.projName);
    }

    if (currentFilters.cbeNoncbe) {
      result = result.filter(e => e.cbeNoncbe === currentFilters.cbeNoncbe);
    }

    if (currentFilters.status) {
      result = result.filter(e => e.status === currentFilters.status);
    }

    setEmployees(result);
  };

  const fetchEmployeeById = async (empcode: string) => {
    setLoading(true);
    try {
      const data = await serviceRef.current.getEmployeeById(empcode);
      setSelectedEmployee(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const importExcel = async (file: File) => {
    setLoading(true);
    try {
      await serviceRef.current.importExcel(file);
      await fetchAllEmployees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDatabase = async (file: File) => {
    setLoading(true);
    try {
      await serviceRef.current.updateDatabase(file);
      await fetchAllEmployees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    await serviceRef.current.exportExcel();
  };

  const updateFilters = (newFilters: EmployeeFilters) => {
    setFilters(newFilters);
    applyFilters(allEmployees, newFilters);
  };

  useEffect(() => {
    fetchAllEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    allEmployees,
    employees,
    selectedEmployee,
    loading,
    error,
    filters,
    updateFilters,
    refresh: fetchAllEmployees,
    fetchEmployeeById,
    importExcel,
    updateDatabase,
    exportExcel,
    clearSelectedEmployee: () => setSelectedEmployee(null)
  };
}