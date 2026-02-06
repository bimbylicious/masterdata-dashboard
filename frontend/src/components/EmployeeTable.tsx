import React, { useState, useMemo } from 'react';
import { EmployeeSummary } from '../types/employee.types';

interface Props {
  employees: EmployeeSummary[];
  userRole: 'admin' | 'employee';
  onRowClick: (empcode: string) => void;
}

type SortField = keyof EmployeeSummary;
type SortDirection = 'asc' | 'desc' | 'none';

export const EmployeeTable: React.FC<Props> = ({ employees, userRole, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'none') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection('none');
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEmployees = useMemo(() => {
    const sorted = [...employees];

    if (!sortField || sortDirection === 'none') {
      return sorted;
    }

    return sorted.sort((a, b) => {
      const aVal = String(a[sortField]).toLowerCase();
      const bVal = String(b[sortField]).toLowerCase();
      const dir = sortDirection === 'asc' ? 1 : -1;

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [employees, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const columns: { key: SortField; label: string }[] = [
    { key: 'empcode', label: 'Emp Code' },
    { key: 'fullName', label: 'Name' },
    { key: 'position', label: 'Position' },
    { key: 'rank', label: 'Rank' },
    { key: 'projName', label: 'Project' },
    { key: 'empStatus', label: 'Emp Status' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="table-wrapper">
      <table className="employees-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>#</th>
            {columns.map(col => (
              <th
                key={col.key}
                className={`sortable ${sortField === col.key && sortDirection !== 'none' ? 'sort-active' : ''}`}
                onClick={() => handleSort(col.key)}
                title={`Click to sort by ${col.label}`}
              >
                <span className="column-label">{col.label}</span>
                <span className="sort-icon">{getSortIcon(col.key)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedEmployees.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
                🔭 No employees to display
              </td>
            </tr>
          ) : (
            sortedEmployees.map((emp, index) => (
              <tr 
                key={emp.empcode} 
                onClick={() => onRowClick(emp.empcode)}
                onMouseEnter={() => setHoveredRow(emp.empcode)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`employee-row ${hoveredRow === emp.empcode ? 'row-hovered' : ''}`}
              >
                <td className="row-number">{index + 1}</td>
                <td className="id-number" title={emp.empcode}>{emp.empcode}</td>
                <td className="employee-name">
                  <span className="name-indicator">
                    {emp.cbeNoncbe === 'Y' ? '⭐' : '👤'}
                  </span>
                  {emp.fullName}
                </td>
                <td className="position" title={emp.position}>{emp.position}</td>
                <td className="rank">{emp.rank}</td>
                <td className="proj-name" title={emp.projName}>{emp.projName}</td>
                <td className="emp-status">
                  <span className="status-label">{emp.empStatus}</span>
                </td>
                <td className="status">
                  <span className={`status-badge ${emp.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    <span className="status-dot">●</span>
                    {emp.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="table-footer">
        <span className="record-count">
          📊 {sortedEmployees.length} {sortedEmployees.length === 1 ? 'record' : 'records'} found
        </span>
        {sortField && sortDirection !== 'none' && (
          <span className="sort-info">
            Sorted by {columns.find(c => c.key === sortField)?.label} ({sortDirection})
          </span>
        )}
      </div>
    </div>
  );
};