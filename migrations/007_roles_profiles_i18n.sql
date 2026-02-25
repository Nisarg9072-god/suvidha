-- USER ADDITIONS: language + consent (kiosk practical) 
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'; 
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted BOOLEAN NOT NULL DEFAULT FALSE; 
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ; 

-- DEPARTMENT ADMINS (role hierarchy) 
-- Keep role in users.role: citizen/admin/staff/dept_admin 
-- Map dept_admin to a department: 
CREATE TABLE IF NOT EXISTS user_departments ( 
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, 
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE 
); 

CREATE INDEX IF NOT EXISTS idx_user_departments_dept ON user_departments(department_id); 

