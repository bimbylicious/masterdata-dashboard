import React, { useState, useEffect } from 'react';
import { EmployeeFilters as FiltersType } from '../types/filter.types';

interface FilterOptions {
  ranks: string[];
  empStatuses: string[];
  positions: string[];
  projNames: string[];
  cbeNoncbes: string[];
}

interface Props {
  onFilterChange: (filters: FiltersType) => void;
  employees: any[];
}

export const EmployeeFilters: React.FC<Props> = ({ onFilterChange, employees }) => {
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState('');
  const [empStatus, setEmpStatus] = useState('');
  const [position, setPosition] = useState('');
  const [projName, setProjName] = useState('');
  const [cbeNoncbe, setCbeNoncbe] = useState('');
  const [status, setStatus] = useState('');

  const [options, setOptions] = useState<FilterOptions>({
    ranks: [],
    empStatuses: [],
    positions: [],
    projNames: [],
    cbeNoncbes: []
  });

  useEffect(() => {
    if (!employees || employees.length === 0) return;

    const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))].sort();

    setOptions({
      ranks: unique(employees.map((e: any) => e.rank)),
      empStatuses: unique(employees.map((e: any) => e.empStatus)),
      positions: unique(employees.map((e: any) => e.position)),
      projNames: unique(employees.map((e: any) => e.projName)),
      cbeNoncbes: unique(employees.map((e: any) => e.cbeNoncbe))
    });
  }, [employees]);

  const applyFilters = (overrides: Partial<FiltersType> = {}) => {
    const filters: FiltersType = {
      search: search || undefined,
      rank: rank || undefined,
      empStatus: empStatus || undefined,
      position: position || undefined,
      projName: projName || undefined,
      cbeNoncbe: cbeNoncbe || undefined,
      status: (status as any) || undefined,
      ...overrides
    };
    onFilterChange(filters);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    applyFilters({ search: e.target.value || undefined });
  };

  const handleSelect = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: string
  ) => {
    setter(value);
    applyFilters({ [field]: value || undefined } as any);
  };

  const clearAll = () => {
    setSearch('');
    setRank('');
    setEmpStatus('');
    setPosition('');
    setProjName('');
    setCbeNoncbe('');
    setStatus('');
    onFilterChange({});
  };

  const renderSelect = (
    label: string,
    value: string,
    options: string[],
    field: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string
  ) => (
    <div className="filter-group">
      <label>{label}</label>
      <select value={value} onChange={(e) => handleSelect(e.target.value, setter, field)}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="filters-container">
      {/* Search Row */}
      <div className="filters-row">
        <div className="filter-group search-group">
          <label>🔍 Search by Name, Emp Code, Position, or Project</label>
          <input
            type="text"
            placeholder="e.g., John Doe, A9007789, Engineer..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* First Row of Filters */}
      <div className="filters-row">
        {renderSelect("Rank", rank, options.ranks, "rank", setRank, "All Ranks")}
        {renderSelect("Emp Status", empStatus, options.empStatuses, "empStatus", setEmpStatus, "All Statuses")}
        {renderSelect("Position", position, options.positions, "position", setPosition, "All Positions")}
        {renderSelect("CBE/NonCBE", cbeNoncbe, options.cbeNoncbes, "cbeNoncbe", setCbeNoncbe, "All Types")}
      </div>

      {/* Second Row of Filters */}
      <div className="filters-row">
        {renderSelect("Project", projName, options.projNames, "projName", setProjName, "All Projects")}
        
        <div className="filter-group">
          <label>Status</label>
          <select value={status} onChange={(e) => handleSelect(e.target.value, setStatus, "status")}>
            <option value="">All Status</option>
            <option value="active">● Active</option>
            <option value="inactive">● Inactive</option>
          </select>
        </div>
      </div>

      {/* Clear Button Row */}
      <div className="filters-row filters-actions">
        <button className="btn-clear" onClick={clearAll}>✕ Clear All Filters</button>
      </div>
    </div>
  );
};