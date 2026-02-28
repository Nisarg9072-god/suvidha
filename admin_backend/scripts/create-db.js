const { Client } = require('pg');

async function main() {
  const url = 'postgresql://postgres:postgres@localhost:5432/postgres';
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query('CREATE DATABASE suvidha');
    console.log('Database suvidha created');
  } catch (e) {
    console.error('Create DB error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();
