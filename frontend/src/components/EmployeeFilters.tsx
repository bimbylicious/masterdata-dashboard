import React, { useState, useEffect } from 'react';
import { EmployeeFilters as FiltersType } from '../types/filter.types';

interface FilterOptions {
  monthsCleared: string[];
  positions: string[];
  projectDepartments: string[];
  regions: string[];
  sectors: string[];
  ranks: string[];
  employmentStatuses: string[];
}

interface Props {
  onFilterChange: (filters: FiltersType) => void;
  employees: any[];
}

export const EmployeeFilters: React.FC<Props> = ({ onFilterChange, employees }) => {
  const [search, setSearch] = useState('');
  const [monthCleared, setMonthCleared] = useState('');
  const [position, setPosition] = useState('');
  const [projectDepartment, setProjectDepartment] = useState('');
  const [region, setRegion] = useState('');
  const [sector, setSector] = useState('');
  const [rank, setRank] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [status, setStatus] = useState('');

  // Derive unique filter options from the FULL employee list
  const [options, setOptions] = useState<FilterOptions>({
    monthsCleared: [],
    positions: [],
    projectDepartments: [],
    regions: [],
    sectors: [],
    ranks: [],
    employmentStatuses: []
  });

  useEffect(() => {
    if (!employees || employees.length === 0) return;

    const unique = (arr: string[]) => [...new Set(arr.filter(Boolean))].sort();

    setOptions({
      monthsCleared: unique(employees.map((e: any) => e.monthCleared)),
      positions: unique(employees.map((e: any) => e.position)),
      projectDepartments: unique(employees.map((e: any) => e.projectDepartment)),
      regions: unique(employees.map((e: any) => e.region)),
      sectors: unique(employees.map((e: any) => e.sector)),
      ranks: unique(employees.map((e: any) => e.rank)),
      employmentStatuses: unique(employees.map((e: any) => e.employmentStatus))
    });
  }, [employees]);

  const applyFilters = (overrides: Partial<FiltersType> = {}) => {
    const filters: FiltersType = {
      search: search || undefined,
      region: region || undefined,
      sector: sector || undefined,
      employmentStatus: (employmentStatus as any) || undefined,
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
    setMonthCleared('');
    setPosition('');
    setProjectDepartment('');
    setRegion('');
    setSector('');
    setRank('');
    setEmploymentStatus('');
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
          <label>🔍 Search by Name, ID, or Position</label>
          <input
            type="text"
            placeholder="e.g., John Doe, A9007789..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* First Row of Filters */}
      <div className="filters-row">
        {renderSelect("Region", region, options.regions, "region", setRegion, "All Regions")}
        {renderSelect("Sector", sector, options.sectors, "sector", setSector, "All Sectors")}
        {renderSelect("Employment Status", employmentStatus, options.employmentStatuses, "employmentStatus", setEmploymentStatus, "All Types")}
        {renderSelect("Rank", rank, options.ranks, "rank", setRank, "All Ranks")}
      </div>

      {/* Second Row of Filters */}
      <div className="filters-row">
        {renderSelect("Position", position, options.positions, "position", setPosition, "All Positions")}
        {renderSelect("Project / Department", projectDepartment, options.projectDepartments, "projectDepartment", setProjectDepartment, "All Projects")}
        {renderSelect("Month Cleared", monthCleared, options.monthsCleared, "monthCleared", setMonthCleared, "All Months")}
        
        {/* Status Filter - Active/Inactive */}
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