CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  no INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month_cleared VARCHAR(50),
  id_number VARCHAR(50) UNIQUE NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  position VARCHAR(200) NOT NULL,
  project_department VARCHAR(200) NOT NULL,
  region VARCHAR(100) NOT NULL,
  sector VARCHAR(200) NOT NULL,
  rank VARCHAR(100) NOT NULL,
  employment_status VARCHAR(100) NOT NULL,
  effective_date_of_resignation VARCHAR(50),
  full_name VARCHAR(300) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_id_number ON employees(id_number);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_region ON employees(region);