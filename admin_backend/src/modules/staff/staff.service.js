const { query } = require("../../config/db");

async function list(user) {
  if (user.role === "staff") {
    throw new Error("FORBIDDEN_STAFF_LIST");
  }
  const params = [];
  let sql = `
    SELECT u.id, u.name, u.phone, ud.department_id
    FROM users u
    LEFT JOIN user_departments ud ON ud.user_id = u.id
    WHERE u.role = 'staff'
  `;
  if (user.role === "dept_admin" && user.department_id) {
    params.push(user.department_id);
    sql += ` AND ud.department_id = $${params.length}`;
  }
  sql += ` ORDER BY u.id DESC`;
  const { rows } = await query(sql, params);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    department_id: r.department_id,
    active: true
  }));
}

function normalizeDeptCode(d) {
  if (!d) return null;
  const v = String(d).toLowerCase();
  if (["gas", "gas_department"].includes(v)) return "GAS";
  if (["electricity", "elec", "electric"].includes(v)) return "ELEC";
  if (["municipal", "muni", "municipality"].includes(v)) return "MUNI";
  const up = String(d).toUpperCase();
  if (["GAS", "ELEC", "MUNI"].includes(up)) return up;
  return null;
}

async function create(user, { name, phone, departmentCode }) {
  if (user.role !== "admin" && user.role !== "dept_admin") {
    throw new Error("FORBIDDEN_STAFF_CREATE");
  }
  const { rows: exists } = await query(`SELECT id FROM users WHERE phone=$1`, [phone]);
  let staffId;
  if (exists.length) {
    staffId = exists[0].id;
    await query(`UPDATE users SET role='staff', name=COALESCE($1, name) WHERE id=$2`, [name || null, staffId]);
  } else {
    const { rows } = await query(`INSERT INTO users (name, phone, role) VALUES ($1,$2,'staff') RETURNING id`, [name || null, phone]);
    staffId = rows[0].id;
  }
  const code = normalizeDeptCode(departmentCode);
  if (code) {
    const { rows: depRows } = await query(`SELECT id FROM departments WHERE code=$1`, [code]);
    if (depRows.length) {
      await query(
        `INSERT INTO user_departments (user_id, department_id) VALUES ($1,$2)
         ON CONFLICT (user_id) DO UPDATE SET department_id=EXCLUDED.department_id`,
        [staffId, depRows[0].id]
      );
    }
  }
  return { id: staffId };
}

module.exports = { list, create };
