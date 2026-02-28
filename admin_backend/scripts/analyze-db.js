require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function q(client, sql) {
  const r = await client.query(sql);
  return r.rows;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const report = {};
  try {
    await client.connect();
    report.tables = await q(client, `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
      ORDER BY table_name
    `);
    report.indexes = await q(client, `
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname='public'
      ORDER BY tablename, indexname
    `);
    report.sequences = await q(client, `
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema='public'
      ORDER BY sequence_name
    `);
    report.foreign_keys = await q(client, `
      SELECT conname AS constraint_name,
             conrelid::regclass AS table_name,
             pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE contype='f'
      ORDER BY conrelid::regclass::text, conname
    `);
    // Row counts
    const tables = report.tables.map(t => t.table_name);
    report.row_counts = {};
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
      report.row_counts[t] = r.rows[0].c;
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('analyze-db error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

main();
