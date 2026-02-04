import React, { useState } from 'react';
import { Employee } from '../types/employee.types';
import { EmployeeService } from '../services/employee.service';

interface Props {
  employee: Employee;
  userRole: 'admin' | 'employee';
  onClose: () => void;
  onUpdate?: (updatedEmployee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export const EmployeeDetailModal: React.FC<Props> = ({ 
  employee, 
  userRole, 
  onClose, 
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName || '',
    position: employee.position,
    projectDepartment: employee.projectDepartment,
    region: employee.region,
    sector: employee.sector,
    rank: employee.rank,
    employmentStatus: employee.employmentStatus,
    monthCleared: employee.monthCleared || '',
    status: employee.status,
    effectiveDateOfResignation: employee.effectiveDateOfResignation || ''
  });

  const service = new EmployeeService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build fullName from name parts
      const nameParts = [
        formData.firstName,
        formData.middleName,
        formData.lastName
      ].filter(Boolean);
      const fullName = nameParts.join(' ');

      const updatedData: Partial<Employee> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        position: formData.position,
        projectDepartment: formData.projectDepartment,
        region: formData.region,
        sector: formData.sector,
        rank: formData.rank,
        employmentStatus: formData.employmentStatus,
        monthCleared: formData.monthCleared || undefined,
        status: formData.status as 'active' | 'inactive',
        effectiveDateOfResignation: formData.effectiveDateOfResignation || undefined,
        fullName: fullName
      };

      const updatedEmployee = await service.updateEmployee(employee.id, updatedData);
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate(updatedEmployee);
      }
      
      // Auto-close after successful save
      setTimeout(() => onClose(), 500);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await service.deleteEmployee(employee.id);
      
      if (onDelete) {
        onDelete(employee.id);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || '',
      position: employee.position,
      projectDepartment: employee.projectDepartment,
      region: employee.region,
      sector: employee.sector,
      rank: employee.rank,
      employmentStatus: employee.employmentStatus,
      monthCleared: employee.monthCleared || '',
      status: employee.status,
      effectiveDateOfResignation: employee.effectiveDateOfResignation || ''
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{isEditing ? 'Edit Employee' : employee.fullName}</h2>
            <p className="modal-subtitle">
              {isEditing ? `ID: ${employee.idNumber}` : `ID: ${employee.idNumber} • ${employee.position}`}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>✕</button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-box" style={{ margin: '16px 24px 0' }}>
            ⚠ {error}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {isEditing ? (
            <form className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Rank</label>
                  <input
                    type="text"
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Project / Department *</label>
                  <input
                    type="text"
                    name="projectDepartment"
                    value={formData.projectDepartment}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sector</label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month Cleared</label>
                  <input
                    type="text"
                    name="monthCleared"
                    value={formData.monthCleared}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Resignation Date</label>
                  <input
                    type="date"
                    name="effectiveDateOfResignation"
                    value={formData.effectiveDateOfResignation ? formData.effectiveDateOfResignation.split('T')[0] : ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="detail-grid">

              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{employee.firstName}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{employee.lastName}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Middle Name</span>
                <span className="detail-value">
                  {employee.middleName ? employee.middleName : <span className="muted">N/A</span>}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">ID Number</span>
                <span className="detail-value">{employee.idNumber}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Position</span>
                <span className="detail-value">{employee.position}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Rank</span>
                <span className="detail-value">{employee.rank}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Project / Department</span>
                <span className="detail-value">{employee.projectDepartment}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Region</span>
                <span className="detail-value">{employee.region}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Sector</span>
                <span className="detail-value">{employee.sector}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Employment Status</span>
                <span className="detail-value">{employee.employmentStatus}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Year</span>
                <span className="detail-value">{employee.year}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Month Cleared</span>
                <span className="detail-value">
                  {employee.monthCleared ? employee.monthCleared : <span className="muted">N/A</span>}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={`status-badge ${employee.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {employee.status === 'active' ? '● Active' : '● Inactive'}
                  </span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Resignation Date</span>
                <span className="detail-value">
                  {employee.effectiveDateOfResignation
                    ? new Date(employee.effectiveDateOfResignation).toLocaleDateString()
                    : <span className="muted">N/A</span>
                  }
                </span>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {userRole === 'admin' && (
          <div className="modal-footer">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-edit" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? '💾 Saving...' : '✓ Save'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  ✕ Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  ✎ Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Deleting...' : '🗑 Delete'}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};