import React from 'react';
import { ClearanceType } from '../services/clearance.service';

interface Props {
  employeeName: string;
  onSelect: (type: ClearanceType) => void;
  onCancel: () => void;
  isGenerating: boolean;
}

export const ClearanceTypeModal: React.FC<Props> = ({ 
  employeeName, 
  onSelect, 
  onCancel,
  isGenerating 
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal clearance-type-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Select Clearance Type</h2>
            <p className="modal-subtitle">For: {employeeName}</p>
          </div>
          <button 
            className="modal-close" 
            onClick={onCancel}
            disabled={isGenerating}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body clearance-type-body">
          <p className="clearance-type-instruction">
            Please select the type of clearance form to generate:
          </p>

          <div className="clearance-type-options">
            
            {/* Project Hire Option */}
            <button 
              className="clearance-type-option"
              onClick={() => onSelect('project-hire')}
              disabled={isGenerating}
            >
              <div className="clearance-type-icon">👷</div>
              <div className="clearance-type-content">
                <h3>Project Hire Employee</h3>
                <p>For employees hired on a project basis</p>
              </div>
              <div className="clearance-type-arrow">→</div>
            </button>

            {/* Contractual Option */}
            <button 
              className="clearance-type-option"
              onClick={() => onSelect('contractual')}
              disabled={isGenerating}
            >
              <div className="clearance-type-icon">📝</div>
              <div className="clearance-type-content">
                <h3>Contractual Employee</h3>
                <p>For contractual employees</p>
              </div>
              <div className="clearance-type-arrow">→</div>
            </button>

          </div>

          {isGenerating && (
            <div className="clearance-generating">
              <div className="spinner"></div>
              <p>Generating clearance form...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isGenerating}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};