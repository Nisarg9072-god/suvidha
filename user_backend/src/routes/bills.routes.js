const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { audit } = require("../utils/audit");

const router = express.Router();

// Citizen: view my bills
router.get("/bills", requireAuth, async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT b.*, d.code AS department_code, d.name AS department_name 
       FROM bills b 
       JOIN departments d ON d.id=b.department_id 
       WHERE b.user_id=$1 
       ORDER BY b.due_date DESC`,
      [req.user.id]
    );
    res.json({ bills: r.rows });
  } catch (e) { next(e); }
});

// Admin/Demo: generate mock bills for a user
router.post("/admin/bills/mock-generate", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { userId, departmentCode, billType, amount } = req.body;
    if (!userId || !departmentCode || !billType || typeof amount !== "number") {
      return res.status(400).json({ error: "userId, departmentCode, billType, amount required" });
    }

    const d = await db.query("SELECT id FROM departments WHERE code=$1", [departmentCode]);
    if (d.rowCount === 0) return res.status(400).json({ error: "Invalid departmentCode" });

    const amountPaise = Math.round(amount * 100);
    const due = new Date(); due.setDate(due.getDate() + 7);

    const ins = await db.query(
      `INSERT INTO bills (user_id, department_id, bill_type, amount_paise, due_date) 
       VALUES ($1,$2,$3,$4,$5) 
       RETURNING *`,
      [userId, d.rows[0].id, billType, amountPaise, due.toISOString().slice(0,10)]
    );

    try {
      await audit(req, {
        action: "bill_generate",
        entityType: "bill",
        entityId: ins.rows[0].id,
        meta: { userId, departmentId: d.rows[0].id, billType, amountPaise }
      });
    } catch {}
    res.status(201).json({ bill: ins.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
