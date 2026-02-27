const { query } = require("../../config/db");

async function list() {
  const { rows } = await query(`SELECT id, code, name FROM departments ORDER BY code ASC`, []);
  return rows;
}

module.exports = { list };
