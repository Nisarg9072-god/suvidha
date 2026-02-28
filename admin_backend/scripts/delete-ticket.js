require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const id = parseInt(process.argv[2], 10);
  if (!id) {
    console.error('ticket id required');
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const sel = await client.query('SELECT id, title FROM tickets WHERE id=$1', [id]);
    console.log('selected:', sel.rowCount, sel.rows[0]);
    const del = await client.query('DELETE FROM tickets WHERE id=$1', [id]);
    console.log('deleted:', del.rowCount);
  } catch (e) {
    console.error('delete-ticket error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

main();
