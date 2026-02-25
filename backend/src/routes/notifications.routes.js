const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/notifications", requireAuth, async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ notifications: r.rows });
  } catch (e) { next(e); }
});

router.patch("/notifications/:id/read", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const u = await db.query(
      `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, req.user.id]
    );
    if (!u.rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ notification: u.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;

