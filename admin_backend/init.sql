CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','dept_admin','staff')),
  department_id INT REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  citizen_phone TEXT,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  category TEXT,
  priority TEXT,
  status TEXT,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sla_deadline TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

CREATE TABLE IF NOT EXISTS ticket_updates (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status TEXT,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  ip TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
