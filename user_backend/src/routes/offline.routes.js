const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.post("/offline/queue", async (req, res, next) => {
  try {
    const { kioskId, payload } = req.body || {};
    if (!kioskId || !payload) return res.status(400).json({ error: "kioskId and payload required" });
    const ins = await db.query(
      `INSERT INTO offline_queue (kiosk_id, payload) VALUES ($1,$2) RETURNING *`,
      [kioskId, payload]
    );
    res.status(201).json({ item: ins.rows[0] });
  } catch (e) { next(e); }
});

router.get("/admin/offline/queue", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const r = await db.query(`SELECT * FROM offline_queue ORDER BY created_at DESC LIMIT 200`);
    res.json({ queue: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

