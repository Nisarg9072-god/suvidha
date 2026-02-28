const express = require("express");
const { query } = require("../../config/db");
const router = express.Router();

router.get("/tickets", async (req, res) => {
  try {
    const r = await query(
      "SELECT id, title, status, department_id, service_type, priority, created_at FROM tickets ORDER BY created_at DESC LIMIT 5"
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
