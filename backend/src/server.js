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
      dept TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      ward TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      sla_due_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
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
