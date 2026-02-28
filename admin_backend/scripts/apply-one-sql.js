require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error('Usage: node scripts/apply-one-sql.js <relative-or-absolute-sql-path>');
    process.exit(1);
  }
  const sqlPath = path.isAbsolute(argPath) ? argPath : path.join(process.cwd(), argPath);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Applied SQL file:', sqlPath);
  } catch (e) {
    console.error('Apply error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();
