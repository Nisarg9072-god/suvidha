const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.post("/services/certificates", requireAuth, async (req, res, next) => {
  try {
    const { type, formData } = req.body || {};
    if (!["CERT_BIRTH", "CERT_DEATH"].includes(type)) return res.status(400).json({ error: "Invalid type" });

    const dept = await db.query("SELECT id FROM departments WHERE code='MUNI'");
    const departmentId = dept.rows[0].id;

    const ticket = await db.query(
      `INSERT INTO tickets (user_id, title, description, status, department_id, service_type, priority, created_at) 
       VALUES ($1,$2,$3,'open',$4,$5,'MED',NOW()) 
       RETURNING *`,
      [req.user.id, `${type} request`, "Certificate service request", departmentId, type]
    );

    const requiredDocs = type === "CERT_BIRTH"
      ? ["Hospital proof", "Parent ID", "Address proof"]
      : ["Death proof", "Applicant ID", "Address proof"];

    const sr = await db.query(
      `INSERT INTO service_requests (ticket_id, service_code, form_data, required_docs) 
       VALUES ($1,$2,$3,$4) 
       RETURNING *`,
      [ticket.rows[0].id, type, formData || {}, JSON.stringify(requiredDocs)]
    );

    res.status(201).json({ ticket: ticket.rows[0], serviceRequest: sr.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;

