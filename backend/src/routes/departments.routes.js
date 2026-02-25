const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// Public list (kiosk can show departments without login)
router.get("/departments", async (req, res, next) => {
  try {
    const r = await pool.query("SELECT id, code, name FROM departments ORDER BY id");
    res.json({ departments: r.rows });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

