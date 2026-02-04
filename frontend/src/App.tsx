import React, { useState } from 'react';
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
    exportExcel,
    fetchEmployeeById,
    clearSelectedEmployee,
    updateFilters,
    refresh
  } = useEmployees();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const userRole: 'admin' | 'employee' = 'admin';

  // Add toast notification
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addToast('info', `📥 Importing ${file.name}...`);
      importExcel(file);
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

  return (
    <div className="app">
      {/* Header */}
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
            <label className="btn btn-primary upload-btn" title="Import employees from Excel file">
              📥 Import Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} hidden />
            </label>
            <button className="btn btn-secondary" onClick={handleExport} title="Export all employees to Excel">
              📤 Export Excel
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{allEmployees.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Displaying</span>
            <span className="stat-value">{employees.length}</span>
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

        {/* Filters */}
        <EmployeeFilters onFilterChange={updateFilters} employees={allEmployees} />

        {/* Error */}
        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
            <button className="close-btn" onClick={() => window.location.reload()}>✕</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="table-container">
            {employees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Employees Found</h3>
                <p>Try adjusting your filters or import an Excel file to get started.</p>
              </div>
            ) : (
              <EmployeeTable
                employees={employees}
                userRole={userRole}
                onRowClick={(id) => {
                  fetchEmployeeById(id);
                  addToast('info', '👁️ Loading employee details...');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          userRole={userRole}
          onClose={clearSelectedEmployee}
          onUpdate={handleEmployeeUpdate}
          onDelete={handleEmployeeDelete}
        />
      )}

      {/* Toast Notifications */}
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

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2024 Masterdata Dashboard • Built with React & PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;