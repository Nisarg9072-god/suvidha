-- BILL TYPES CATALOG 
CREATE TABLE IF NOT EXISTS bill_types ( 
  id BIGSERIAL PRIMARY KEY, 
  code TEXT UNIQUE NOT NULL,         -- GAS_BILL, ELEC_BILL, PROPERTY_TAX 
  name TEXT NOT NULL, 
  department_id BIGINT NOT NULL REFERENCES departments(id), 
  is_active BOOLEAN NOT NULL DEFAULT TRUE 
); 

INSERT INTO bill_types (code, name, department_id) 
SELECT 'GAS_BILL', 'Gas Bill', d.id FROM departments d WHERE d.code='GAS' 
ON CONFLICT (code) DO NOTHING; 

INSERT INTO bill_types (code, name, department_id) 
SELECT 'ELEC_BILL', 'Electricity Bill', d.id FROM departments d WHERE d.code='ELEC' 
ON CONFLICT (code) DO NOTHING; 

INSERT INTO bill_types (code, name, department_id) 
SELECT 'PROPERTY_TAX', 'Property Tax', d.id FROM departments d WHERE d.code='MUNI' 
ON CONFLICT (code) DO NOTHING; 

