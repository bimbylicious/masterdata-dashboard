import React, { useState } from 'react';
import { Employee } from '../types/employee.types';
import { EmployeeService } from '../services/employee.service';
import { ClearanceService, ClearanceType } from '../services/clearance.service';
import { ClearanceTypeModal } from '../components/ClearanceTypeModal';

interface Props {
  employee: Employee;
  userRole: 'admin' | 'employee';
  onClose: () => void;
  onUpdate?: (updatedEmployee: Employee) => void;
  onDelete?: (empcode: string) => void;
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
  const [showClearanceTypeModal, setShowClearanceTypeModal] = useState(false);
  const [isGeneratingClearance, setIsGeneratingClearance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName || '',
    cbeNoncbe: employee.cbeNoncbe || '',
    rank: employee.rank,
    empStatus: employee.empStatus,
    position: employee.position,
    costcode: employee.costcode || '',
    projName: employee.projName,
    projHr: employee.projHr || '',
    emailAddress: employee.emailAddress || '',
    mobileAssignment: employee.mobileAssignment || '',
    mobileNumber: employee.mobileNumber || '',
    laptopAssignment: employee.laptopAssignment || '',
    assetCode: employee.assetCode || '',
    others: employee.others || '',
    remarks: employee.remarks || '',
    status: employee.status
  });

  const service = new EmployeeService();
  const clearanceService = new ClearanceService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const nameParts = [
        formData.firstName,
        formData.middleName,
        formData.lastName
      ].filter(Boolean);
      const fullName = nameParts.join(' ');

      const updatedData: Partial<Employee> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || '', // Send empty string to clear
        fullName: fullName,
        cbeNoncbe: formData.cbeNoncbe || '', // Send empty string to clear
        rank: formData.rank,
        empStatus: formData.empStatus,
        position: formData.position,
        costcode: formData.costcode || '', // Send empty string to clear
        projName: formData.projName,
        projHr: formData.projHr || '', // Send empty string to clear
        emailAddress: formData.emailAddress || '', // Send empty string to clear
        mobileAssignment: formData.mobileAssignment || '', // Send empty string to clear
        mobileNumber: formData.mobileNumber || '', // Send empty string to clear
        laptopAssignment: formData.laptopAssignment || '', // Send empty string to clear
        assetCode: formData.assetCode || '', // Send empty string to clear
        others: formData.others || '', // Send empty string to clear
        remarks: formData.remarks || '', // Send empty string to clear
        status: formData.status as 'active' | 'inactive'
      };

      console.log('💾 Saving employee data:', updatedData);

      const updatedEmployee = await service.updateEmployee(employee.empcode, updatedData);
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate(updatedEmployee);
      }
      
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
      await service.deleteEmployee(employee.empcode);
      
      if (onDelete) {
        onDelete(employee.empcode);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearanceClick = () => {
    setShowClearanceTypeModal(true);
  };

  const handleClearanceTypeSelect = async (type: ClearanceType) => {
    setIsGeneratingClearance(true);
    setError(null);

    try {
      await clearanceService.generateClearanceForm(employee.empcode, type);
      console.log(`✅ ${type} clearance form generated successfully`);
      setShowClearanceTypeModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate clearance form');
      console.error('Clearance generation error:', err);
    } finally {
      setIsGeneratingClearance(false);
    }
  };

  const handleClearanceCancel = () => {
    setShowClearanceTypeModal(false);
    setError(null);
  };

  const handleCancel = () => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || '',
      cbeNoncbe: employee.cbeNoncbe || '',
      rank: employee.rank,
      empStatus: employee.empStatus,
      position: employee.position,
      costcode: employee.costcode || '',
      projName: employee.projName,
      projHr: employee.projHr || '',
      emailAddress: employee.emailAddress || '',
      mobileAssignment: employee.mobileAssignment || '',
      mobileNumber: employee.mobileNumber || '',
      laptopAssignment: employee.laptopAssignment || '',
      assetCode: employee.assetCode || '',
      others: employee.others || '',
      remarks: employee.remarks || '',
      status: employee.status
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>{isEditing ? 'Edit Employee' : employee.fullName}</h2>
              <p className="modal-subtitle">
                {isEditing ? `Code: ${employee.empcode}` : `${employee.empcode} • ${employee.position}`}
              </p>
            </div>
            <button className="modal-close" onClick={onClose} disabled={isLoading}>✕</button>
          </div>

          {error && (
            <div className="error-box" style={{ margin: '16px 24px 0' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="modal-body">
            {isEditing ? (
              <form className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={isLoading} />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Middle Name</label>
                    <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                  <div className="form-group">
                    <label>CBE/NonCBE</label>
                    <select name="cbeNoncbe" value={formData.cbeNoncbe} onChange={handleInputChange} disabled={isLoading}>
                      <option value="">Not Specified</option>
                      <option value="Y">Y (CBE)</option>
                      <option value="N">N (Non-CBE)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Position *</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} disabled={isLoading} />
                  </div>
                  <div className="form-group">
                    <label>Rank</label>
                    <input type="text" name="rank" value={formData.rank} onChange={handleInputChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Employment Status</label>
                    <select name="empStatus" value={formData.empStatus} onChange={handleInputChange} disabled={isLoading}>
                      <option value="Project Hire">Project Hire</option>
                      <option value="Regular">Regular</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Terminated">Terminated</option>
                      <option value="End of Contract">End of Contract</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cost Code</label>
                    <input type="text" name="costcode" value={formData.costcode} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Project Name *</label>
                    <input type="text" name="projName" value={formData.projName} onChange={handleInputChange} disabled={isLoading} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Project HR</label>
                    <input type="text" name="projHr" value={formData.projHr} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Assignment</label>
                    <input type="text" name="mobileAssignment" value={formData.mobileAssignment} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Laptop Assignment</label>
                    <input type="text" name="laptopAssignment" value={formData.laptopAssignment} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                  <div className="form-group">
                    <label>Asset Code</label>
                    <input type="text" name="assetCode" value={formData.assetCode} onChange={handleInputChange} disabled={isLoading} placeholder="Leave blank to clear" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Others (Specify items assigned)</label>
                    <textarea 
                      name="others" 
                      value={formData.others} 
                      onChange={handleInputChange} 
                      disabled={isLoading} 
                      rows={2}
                      placeholder="Leave blank to clear"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Remarks</label>
                    <textarea 
                      name="remarks" 
                      value={formData.remarks} 
                      onChange={handleInputChange} 
                      disabled={isLoading} 
                      rows={2}
                      placeholder="Leave blank to clear"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} disabled={isLoading}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            ) : (
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Employee Code</span>
                  <span className="detail-value">{employee.empcode}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">First Name</span>
                  <span className="detail-value">{employee.firstName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Middle Name</span>
                  <span className="detail-value">{employee.middleName || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <span className="detail-value">{employee.lastName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">CBE/NonCBE</span>
                  <span className="detail-value">{employee.cbeNoncbe || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Rank</span>
                  <span className="detail-value">{employee.rank}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Employment Status</span>
                  <span className="detail-value">{employee.empStatus}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Position</span>
                  <span className="detail-value">{employee.position}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Cost Code</span>
                  <span className="detail-value">{employee.costcode || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                  <span className="detail-label">Project Name</span>
                  <span className="detail-value">{employee.projName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Project HR</span>
                  <span className="detail-value">{employee.projHr || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{employee.emailAddress || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Mobile Assignment</span>
                  <span className="detail-value">{employee.mobileAssignment || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Mobile Number</span>
                  <span className="detail-value">{employee.mobileNumber || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Laptop Assignment</span>
                  <span className="detail-value">{employee.laptopAssignment || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Asset Code</span>
                  <span className="detail-value">{employee.assetCode || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                  <span className="detail-label">Others (Items Assigned)</span>
                  <span className="detail-value">{employee.others || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                  <span className="detail-label">Remarks</span>
                  <span className="detail-value">{employee.remarks || <span className="muted">N/A</span>}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`status-badge ${employee.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {employee.status === 'active' ? '● Active' : '● Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {userRole === 'admin' && (
            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button className="btn btn-edit" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? '💾 Saving...' : '✓ Save'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel} disabled={isLoading}>
                    ✕ Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-clearance" onClick={handleClearanceClick} disabled={isLoading}>
                    📄 Clearance
                  </button>
                  <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                    ✎ Edit
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? '⏳ Deleting...' : '🗑 Delete'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showClearanceTypeModal && (
        <ClearanceTypeModal
          employeeName={employee.fullName}
          onSelect={handleClearanceTypeSelect}
          onCancel={handleClearanceCancel}
          isGenerating={isGeneratingClearance}
        />
      )}
    </>
  );
};