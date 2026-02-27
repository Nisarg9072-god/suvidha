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

module.exports = { list };
