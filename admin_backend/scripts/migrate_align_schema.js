require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool } = require('../src/config/db');

async function run() {
  try {
    console.log('Starting schema alignment...');
    await pool.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS code TEXT UNIQUE`);
    await pool.query(`
      INSERT INTO departments (name, code) VALUES 
        ('Gas', 'GAS'),
        ('Electricity', 'ELEC'),
        ('Municipal', 'MUNI')
      ON CONFLICT (code) DO NOTHING
    `);

    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS title TEXT`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS service_type TEXT`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS area TEXT`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMP`);
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)`);

    console.log('Schema alignment complete.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

run();
