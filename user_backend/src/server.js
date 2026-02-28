require("dotenv").config();
const app = require("./app");
const { pool } = require("./db");

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone VARCHAR(20) UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'citizen',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted BOOLEAN NOT NULL DEFAULT FALSE;`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );
  `);
  await pool.query(`
    INSERT INTO departments (code, name) VALUES
      ('GAS','Gas Department'),
      ('ELEC','Electricity Department'),
      ('MUNI','Municipal Corporation')
    ON CONFLICT (code) DO NOTHING;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS otps (
      mobile TEXT PRIMARY KEY,
      otp_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      request_count INTEGER NOT NULL DEFAULT 0,
      last_request_at TIMESTAMPTZ
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      dept TEXT,
      category TEXT,
      priority TEXT NOT NULL DEFAULT 'MED',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      ward TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      sla_due_at TIMESTAMPTZ,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department_id INT REFERENCES departments(id) ON DELETE SET NULL`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS service_type TEXT`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN NOT NULL DEFAULT FALSE`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS area TEXT`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to INT REFERENCES users(id) ON DELETE SET NULL`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_department_id ON tickets(department_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_area ON tickets(area)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_sla_due_at ON tickets(sla_due_at)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_updates (
      id SERIAL PRIMARY KEY,
      ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      note TEXT,
      updated_by INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id INT,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS work_orders (
      id SERIAL PRIMARY KEY,
      ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      assigned_staff_id INT REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'assigned',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_work_orders_ticket ON work_orders(ticket_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_work_orders_staff ON work_orders(assigned_staff_id)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked BOOLEAN NOT NULL DEFAULT FALSE,
      revoked_by INT REFERENCES users(id) ON DELETE SET NULL,
      revoked_at TIMESTAMPTZ
    );
  `);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_events (
      id SERIAL PRIMARY KEY,
      ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL,
      performed_by INT REFERENCES users(id) ON DELETE SET NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket ON ticket_events(ticket_id)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_departments (
      user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_departments_dept ON user_departments(department_id)`);
}

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SUVIDHA backend running on port ${PORT}`);
  });
}).catch((e) => {
  console.error("DB init failed:", e);
  process.exit(1);
});
