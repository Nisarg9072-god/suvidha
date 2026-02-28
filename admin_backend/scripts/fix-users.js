const { Client } = require('pg');

async function main() {
  const url = 'postgresql://postgres:postgres@localhost:5432/suvidha';
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS name TEXT;`);
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;`);
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    // Ensure role exists, default 'citizen'
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'citizen';`);
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS preferred_language TEXT;`);
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS consent_accepted BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;`);
    console.log('Users table adjusted');
  } catch (e) {
    console.error('Fix users error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();
