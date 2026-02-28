require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const sqlPath = path.join(__dirname, '..', 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log('DB init applied successfully');
  } catch (e) {
    console.error('DB init error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();
