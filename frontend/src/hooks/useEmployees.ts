import { useState, useEffect, useRef } from 'react';
import { EmployeeService } from '../services/employee.service';
import { EmployeeSummary, Employee } from '../types/employee.types';
import { EmployeeFilters } from '../types/filter.types';

export function useEmployees() {
  const [allEmployees, setAllEmployees] = useState<EmployeeSummary[]>([]);   // full unfiltered list
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);         // currently displayed (filtered)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const serviceRef = useRef(new EmployeeService());

  // Fetch ALL employees once (no filters) – used for filter dropdown options
  const fetchAllEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceRef.current.getAllEmployees();
      // Keep database insertion order - don't sort!
      setAllEmployees(data);
      applyFilters(data, filters);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters client-side on top of allEmployees
  const applyFilters = (currentAll: EmployeeSummary[], currentFilters: EmployeeFilters) => {
    let result = [...currentAll];

    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(q) ||
        e.idNumber.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
      );
    }
    if (currentFilters.region) {
      result = result.filter(e => e.region === currentFilters.region);
    }
    if (currentFilters.sector) {
      result = result.filter(e => e.sector === currentFilters.sector);
    }
    if (currentFilters.employmentStatus) {
      result = result.filter(e => e.employmentStatus === currentFilters.employmentStatus);
    }
    if (currentFilters.rank) {
      result = result.filter(e => e.rank === currentFilters.rank);
    }
    if (currentFilters.projectDepartment) {
      result = result.filter(e => e.projectDepartment === currentFilters.projectDepartment);
    }
    if (currentFilters.monthCleared) {
      result = result.filter(e => e.monthCleared === currentFilters.monthCleared);
    }
    if (currentFilters.position) {
      result = result.filter(e => e.position === currentFilters.position);
    }
    if (currentFilters.status) {
      result = result.filter(e => e.status === currentFilters.status);
    }

    setEmployees(result);
  };

  const fetchEmployeeById = async (id: string) => {
    setLoading(true);
    try {
      const data = await serviceRef.current.getEmployeeById(id);
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
      await fetchAllEmployees(); // re-fetch everything after import
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
      await fetchAllEmployees(); // re-fetch everything after update
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

  // Initial load
  useEffect(() => {
    fetchAllEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    allEmployees,          // full list (for filter dropdowns)
    employees,             // filtered list (for the table)
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