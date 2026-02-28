const express = require("express");
const { pool, query } = require("../../config/db");

const router = express.Router();

router.get("/system/health", async (req, res) => {
  try {
    const dbCheck = await pool.query("SELECT current_database()");
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
    `);
    res.json({
      database: dbCheck.rows[0].current_database,
      tables: tables.rows.map((t) => t.table_name),
      status: "DB_CONNECTED",
    });
  } catch (err) {
    res.status(500).json({
      status: "DB_CONNECTION_FAILED",
      error: err.message,
    });
  }
});

router.get("/system/tickets-check", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, status, department_id, category, priority, created_at
       FROM tickets
       ORDER BY created_at DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/system/admins-check", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, role, department_id
       FROM users
       WHERE role = 'admin'
       ORDER BY id ASC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
