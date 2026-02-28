require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/db');

async function main() {
  const phone = process.argv[2] || '+919999999999';
  try {
    const sel = await db.query('SELECT id, phone, role FROM users WHERE phone=$1', [phone]);
    let user = sel.rows[0];
    if (!user) {
      const ins = await db.query(
        'INSERT INTO users (phone, role, name) VALUES ($1,$2,$3) RETURNING id, phone, role',
        [phone, 'admin', 'Admin']
      );
      user = ins.rows[0];
      console.log('Created user:', user);
    }
    if (user.role === 'admin') {
      console.log('User already admin:', user);
    } else {
      const upd = await db.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id, phone, role', ['admin', user.id]);
      console.log('Updated role:', upd.rows[0]);
    }
  } catch (e) {
    console.error('Error setting admin role:', e.message);
    process.exitCode = 1;
  } finally {
    try { await db.pool.end(); } catch (e) {}
  }
}

main();
