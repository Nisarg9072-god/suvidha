const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { audit } = require("../utils/audit");

const router = express.Router();

const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(5).max(2000),

    departmentCode: z.enum(["GAS", "ELEC", "MUNI"]).optional(),
    serviceType: z.string().min(2).max(60).optional(),
    priority: z.enum(["LOW", "MED", "HIGH", "EMERGENCY"]).optional(),

    area: z.string().min(2).max(80).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
});

function computeSlaDueAt(priority = "MED") {
  const now = new Date();
  const hours =
    priority === "EMERGENCY" ? 2 :
    priority === "HIGH" ? 24 :
    priority === "MED" ? 72 :
    120; // LOW
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

router.post("/", requireAuth, validate(createTicketSchema), async (req, res, next) => {
  try {
    const { title, description, departmentCode, serviceType, priority, area, latitude, longitude } = req.body;

    let departmentId = null;
    if (departmentCode) {
      const d = await pool.query("SELECT id FROM departments WHERE code=$1", [departmentCode]);
      if (d.rowCount === 0) return res.status(400).json({ error: "Invalid departmentCode" });
      departmentId = d.rows[0].id;
    }

    const pri = priority || "MED";
    const isEmergency = pri === "EMERGENCY";
    const slaDueAt = computeSlaDueAt(pri);

    const r = await pool.query(
      `INSERT INTO tickets 
        (user_id, title, description, status, department_id, service_type, priority, is_emergency, area, latitude, longitude, sla_due_at, created_at) 
       VALUES 
        ($1,$2,$3,'open',$4,$5,$6,$7,$8,$9,$10,$11,NOW()) 
       RETURNING *`,
      [req.user.id, title, description, departmentId, serviceType || null, pri, isEmergency, area || null, latitude ?? null, longitude ?? null, slaDueAt]
    );

    const ticket = r.rows[0];
    try {
      await audit(req, {
        action: "ticket_create",
        entityType: "ticket",
        entityId: ticket.id,
        meta: { departmentId, serviceType: serviceType || null, priority: pri, area: area || null }
      });
    } catch {}
    res.status(201).json({ ticket });
  } catch (e) {
    next(e);
  }
});

router.get("/", requireAuth, async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM tickets WHERE user_id=$1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ ok: true, tickets: r.rows });
});

module.exports = router;
