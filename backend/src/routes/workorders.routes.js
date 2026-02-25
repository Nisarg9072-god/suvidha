const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.post("/admin/tickets/:id/work-order", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const ticketId = Number(req.params.id);
    const { staffUserId, notes } = req.body || {};
    const ins = await db.query(
      `INSERT INTO work_orders (ticket_id, assigned_staff_id, notes) 
       VALUES ($1,$2,$3) 
       RETURNING *`,
      [ticketId, staffUserId || null, notes || null]
    );
    res.status(201).json({ workOrder: ins.rows[0] });
  } catch (e) { next(e); }
});

router.get("/staff/work-orders", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "staff" && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const r = await db.query(
      `SELECT * FROM work_orders WHERE assigned_staff_id=$1 ORDER BY created_at DESC LIMIT 200`,
      [req.user.id]
    );
    res.json({ workOrders: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

