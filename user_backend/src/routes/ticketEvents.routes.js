const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/tickets/:id/events", requireAuth, async (req, res, next) => {
  try {
    const tid = parseInt(req.params.id, 10);
    const can = await db.query(`SELECT 1 FROM tickets WHERE id=$1 AND user_id=$2`, [tid, req.user.id]);
    if (can.rowCount === 0) return res.status(403).json({ error: "Forbidden" });
    const { rows } = await db.query(
      `SELECT id, action_type, performed_by, note, created_at 
       FROM ticket_events 
       WHERE ticket_id=$1 
       ORDER BY created_at ASC`,
      [tid]
    );
    res.json({ ok: true, items: rows });
  } catch (e) { next(e); }
});

module.exports = router;
