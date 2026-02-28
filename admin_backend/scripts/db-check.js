require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool, query } = require('../src/config/db');

async function main() {
  try {
    const url = process.env.DATABASE_URL || `${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    console.log('DB URL:', url);
    const colsT = await query(`SELECT column_name,data_type FROM information_schema.columns WHERE table_name='tickets' ORDER BY ordinal_position`);
    console.log('tickets.columns:', colsT.rows);
    const colsD = await query(`SELECT column_name,data_type FROM information_schema.columns WHERE table_name='departments' ORDER BY ordinal_position`);
    console.log('departments.columns:', colsD.rows);
    const u = await query('SELECT COUNT(*)::bigint AS c FROM users');
    const t = await query('SELECT COUNT(*)::bigint AS c FROM tickets');
    const w = await query('SELECT COUNT(*)::bigint AS c FROM work_orders');
    console.log('users:', u.rows[0].c);
    console.log('tickets:', t.rows[0].c);
    console.log('work_orders:', w.rows[0].c);
    const last = await query(`SELECT id, title, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 10`);
    console.log('recent tickets:', last.rows);
  } catch (e) {
    console.error('db-check error:', e.message);
    process.exitCode = 1;
  } finally {
    try { await pool.end(); } catch (e) {}
  }
}

main();
