const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");
const { notify } = require("../utils/notify");

const router = express.Router();

router.get("/admin/tickets/overdue", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const r = await pool.query(`
      SELECT *
      FROM tickets
      WHERE status <> 'resolved'
        AND sla_due_at IS NOT NULL
        AND sla_due_at < NOW()
      ORDER BY sla_due_at ASC
      LIMIT 200
    `);
    res.json({ overdue: r.rows });
  } catch (e) { next(e); }
});

router.post("/admin/sla/run-check", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const overdue = await pool.query(`
      SELECT id, user_id, service_type, priority, sla_due_at 
      FROM tickets 
      WHERE status <> 'resolved' AND sla_due_at IS NOT NULL AND sla_due_at < NOW()
      ORDER BY sla_due_at ASC
      LIMIT 500
    `);
    let count = 0;
    for (const t of overdue.rows) {
      try {
        await notify(t.user_id, {
          type: "sla_overdue",
          title: "SLA overdue",
          message: `Ticket #${t.id} is overdue (priority ${t.priority})`,
          entityType: "ticket",
          entityId: t.id
        });
        count++;
      } catch {}
    }
    res.json({ ok: true, notified: count });
  } catch (e) { next(e); }
});

module.exports = router;
