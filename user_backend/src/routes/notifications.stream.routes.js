const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const { pool } = require("../db");

const router = express.Router();

router.get("/notifications/stream", requireAuth, async (req, res, next) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    let lastTs = new Date(0);
    const snapshot = await pool.query(
      `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id=$1 AND is_read=FALSE`,
      [req.user.id]
    );
    res.write(`event: snapshot\n`);
    res.write(`data: ${JSON.stringify({ unread: snapshot.rows[0]?.unread || 0 })}\n\n`);
    const tick = setInterval(async () => {
      try {
        const { rows } = await pool.query(
          `SELECT id, title, message, type, is_read, created_at 
           FROM notifications 
           WHERE user_id=$1 AND created_at > $2
           ORDER BY created_at ASC
           LIMIT 50`,
          [req.user.id, lastTs]
        );
        for (const n of rows) {
          try {
            res.write(`event: notification\n`);
            res.write(`data: ${JSON.stringify(n)}\n\n`);
            lastTs = new Date(n.created_at);
          } catch (_) {}
        }
        try { res.write(`event: ping\ndata: {}\n\n`); } catch (_) {}
      } catch (e) {}
    }, 5000);
    req.on("close", () => {
      clearInterval(tick);
    });
  } catch (e) { next(e); }
});

module.exports = router;
