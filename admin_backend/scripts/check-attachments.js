require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM ticket_attachments`);
    console.log('ticket_attachments count:', r.rows[0].c);
  } catch (e) {
    console.error('check-attachments error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

main();
