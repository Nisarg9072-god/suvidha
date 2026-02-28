const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.post("/admin/dept-admin/assign", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { userId, departmentCode } = req.body || {};
    if (!userId || !departmentCode) return res.status(400).json({ error: "userId, departmentCode required" });

    const dep = await db.query("SELECT id FROM departments WHERE code=$1", [departmentCode]);
    if (!dep.rowCount) return res.status(400).json({ error: "Invalid departmentCode" });

    await db.query("UPDATE users SET role='dept_admin' WHERE id=$1", [userId]);
    await db.query(
      `INSERT INTO user_departments (user_id, department_id) 
       VALUES ($1,$2) 
       ON CONFLICT (user_id) DO UPDATE SET department_id=EXCLUDED.department_id`,
      [userId, dep.rows[0].id]
    );

    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;

