import React, { useState, useEffect } from 'react';
import { useEmployees } from './hooks/useEmployees';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import './App.css';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const {
    employees,
    allEmployees,
    selectedEmployee,
    loading,
    error,
    importExcel,
    updateDatabase,
    exportExcel,
    fetchEmployeeById,
    clearSelectedEmployee,
    updateFilters,
    refresh
  } = useEmployees();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilteredCount, setPreviousFilteredCount] = useState(0);
  const userRole: 'admin' | 'employee' = 'admin';

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Show toast when filter results change
  useEffect(() => {
    if (!loading && employees.length !== allEmployees.length && employees.length !== previousFilteredCount) {
      const resultText = employees.length === 1 ? 'result' : 'results';
      addToast('info', `🔍 Found ${employees.length} ${resultText}`);
      setPreviousFilteredCount(employees.length);
    }
  }, [employees.length, allEmployees.length, loading, previousFilteredCount]);

  const handleFilterChange = (filters: any) => {
    updateFilters(filters);
    setCurrentPage(1);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addToast('info', `📥 Importing ${file.name}...`);
      importExcel(file);
    }
    e.target.value = '';
  };

  const handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addToast('info', `🔄 Updating database from ${file.name}...`);
      updateDatabase(file);
    }
    e.target.value = '';
  };

  const handleEmployeeUpdate = (updatedEmployee: any) => {
    addToast('success', `✅ ${updatedEmployee.fullName} updated successfully`);
    refresh();
  };

  const handleEmployeeDelete = (employeeId: string) => {
    addToast('success', '✅ Employee deleted successfully');
    refresh();
  };

  const handleExport = async () => {
    try {
      addToast('info', '📤 Exporting employees to Excel...');
      await exportExcel();
      addToast('success', '✅ Excel file downloaded successfully');
    } catch (err: any) {
      addToast('error', `❌ Export failed: ${err.message}`);
    }
  };

  const recordsPerPage = 100;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, employees.length);
  const displayingCount = employees.length === 0 ? 0 : endIndex - startIndex;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">📊</div>
          <div>
            <h1>Masterdata Dashboard</h1>
            <p className="app-tagline">Employee Management System</p>
          </div>
          <span className="role-badge">{userRole === 'admin' ? '⚙ Admin' : '👤 Employee'}</span>
        </div>
        {userRole === 'admin' && (
          <div className="header-actions">
            <label className="btn btn-primary upload-btn" title="Import new employees from Excel (skips duplicates)">
              📥 Import Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFileImport} hidden />
            </label>
            <label className="btn btn-update upload-btn" title="Update existing employees and add new ones from Excel (keeps records not in file)">
              🔄 Update Database
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpdate} hidden />
            </label>
            <button className="btn btn-secondary" onClick={handleExport} title="Export all employees to Excel">
              📤 Export Excel
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{allEmployees.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Displaying</span>
            <span className="stat-value">{displayingCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active</span>
            <span className="stat-value">{allEmployees.filter(e => e.status === 'active').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Inactive</span>
            <span className="stat-value">{allEmployees.filter(e => e.status === 'inactive').length}</span>
          </div>
        </div>

        <EmployeeFilters 
          onFilterChange={handleFilterChange}
          employees={allEmployees} 
        />

        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
            <button className="close-btn" onClick={() => window.location.reload()}>✕</button>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        )}

        {!loading && (
          <div className="table-container">
            <EmployeeTable
              employees={employees}
              userRole={userRole}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onRowClick={(id) => {
                fetchEmployeeById(id);
                addToast('info', '👁️ Loading employee details...');
              }}
            />
          </div>
        )}
      </main>

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          userRole={userRole}
          onClose={clearSelectedEmployee}
          onUpdate={handleEmployeeUpdate}
          onDelete={handleEmployeeDelete}
        />
      )}

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <footer className="app-footer">
        <p>© 2024 Masterdata Dashboard • Built with React & PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;