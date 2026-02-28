const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

// Admin: list staff users
router.get("/admin/staff", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT id, COALESCE(name, 'Staff') AS name, phone, 
              NULL::int AS department_id,
              TRUE AS active
       FROM users
       WHERE role IN ('staff','dept_admin')
       ORDER BY id`
    );
    res.json(r.rows);
  } catch (e) { next(e); }
});

// Staff: see assigned tickets
router.get("/staff/tickets", requireAuth, requireRole(["staff", "admin"]), async (req, res, next) => {
  try {
    const r = await pool.query(
      `SELECT * FROM tickets 
       WHERE assigned_to=$1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ tickets: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

