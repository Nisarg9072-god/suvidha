const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

// Admin analytics dashboard
router.get("/analytics/overview", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const byDept = await pool.query(`
      SELECT d.code, d.name, t.status, COUNT(*)::int AS count 
      FROM tickets t 
      LEFT JOIN departments d ON d.id = t.department_id 
      GROUP BY d.code, d.name, t.status 
      ORDER BY d.code, t.status
    `);

    const overdue = await pool.query(`
      SELECT COUNT(*)::int AS count 
      FROM tickets 
      WHERE status <> 'resolved' 
        AND sla_due_at IS NOT NULL 
        AND sla_due_at < NOW()
    `);

    res.json({
      ticketsByDepartmentAndStatus: byDept.rows,
      overdueCount: overdue.rows[0].count
    });
  } catch (e) { next(e); }
});

// “Outage clusters” (simple area-based clusters)
router.get("/analytics/areas", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT department_id, service_type, area, COUNT(*)::int AS count 
      FROM tickets 
      WHERE area IS NOT NULL 
      GROUP BY department_id, service_type, area 
      ORDER BY count DESC 
      LIMIT 20
    `);
    res.json({ topAreas: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

