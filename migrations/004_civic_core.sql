-- 1) Departments master 
CREATE TABLE IF NOT EXISTS departments ( 
  id BIGSERIAL PRIMARY KEY, 
  code TEXT UNIQUE NOT NULL,     -- GAS / ELEC / MUNI 
  name TEXT NOT NULL 
); 

INSERT INTO departments (code, name) 
VALUES 
  ('GAS', 'Gas Department'), 
  ('ELEC', 'Electricity Department'), 
  ('MUNI', 'Municipal Corporation') 
ON CONFLICT (code) DO NOTHING; 

-- 2) Extend tickets for civic features 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id); 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS service_type TEXT; -- e.g. LEAKAGE, OUTAGE, GARBAGE, CERT_BIRTH 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'MED'; -- LOW/MED/HIGH/EMERGENCY 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN NOT NULL DEFAULT FALSE; 

-- location (for clustering) 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS area TEXT; -- ward/sector/zone text 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION; 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION; 

-- assignment 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to BIGINT REFERENCES users(id); 

-- SLA tracking 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ; 
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ; 

-- Helpful indexes 
CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON tickets(department_id); 
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority); 
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to); 
CREATE INDEX IF NOT EXISTS idx_tickets_area ON tickets(area); 
CREATE INDEX IF NOT EXISTS idx_tickets_sla_due_at ON tickets(sla_due_at); 
