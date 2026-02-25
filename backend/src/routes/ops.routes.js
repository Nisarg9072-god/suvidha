const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// detailed health for ops/judges
router.get("/health/detail", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({
      ok: true,
      db: true,
      time: r.rows[0].now,
      service: "SUVIDHA"
    });
  } catch {
    res.status(500).json({ ok: false, db: false });
  }
});

module.exports = router;

