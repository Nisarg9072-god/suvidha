const express = require("express");
const { addSubscriber, removeSubscriber } = require("../utils/ticketEvents");
const { requireAuth } = require("../middleware/requireAuth");
const { pool } = require("../db");

const router = express.Router();

router.get("/tickets/:id", requireAuth, async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const t = await pool.query("SELECT id, user_id, status, updated_at FROM tickets WHERE id=$1", [ticketId]);
    if (t.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });
    const row = t.rows[0];
    if (req.user.role !== "admin" && String(row.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: snapshot\n`);
    res.write(`data: ${JSON.stringify({ ticketId: row.id, status: row.status, updatedAt: row.updated_at })}\n\n`);
    addSubscriber(ticketId, res);
    const heartbeat = setInterval(() => {
      try { res.write(`event: ping\ndata: {}\n\n`); } catch (_) {}
    }, 25000);
    req.on("close", () => {
      clearInterval(heartbeat);
      removeSubscriber(ticketId, res);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
