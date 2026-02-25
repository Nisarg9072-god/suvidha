const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

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

