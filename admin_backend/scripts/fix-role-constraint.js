const { Client } = require('pg');

async function main() {
  const url = 'postgresql://postgres:postgres@localhost:5432/suvidha';
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(`ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check;`);
    await client.query(`ALTER TABLE IF EXISTS users ADD CONSTRAINT users_role_check CHECK (role IN ('citizen','admin','dept_admin','staff'));`);
    console.log('Users role constraint updated');
  } catch (e) {
    console.error('Fix role constraint error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();
