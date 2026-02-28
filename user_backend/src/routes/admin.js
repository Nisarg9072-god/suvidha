const express = require("express");
const { pool } = require("../db");
const { publish } = require("../utils/ticketEvents");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { canTransition, allowedStatuses } = require("../utils/workflow");
const { notify } = require("../utils/notify");
const { audit } = require("../utils/audit");

const router = express.Router();

// GET /admin/tickets with filters
router.get("/tickets", requireAuth, requireRole(["admin", "supervisor", "clerk"]), async (req, res, next) => {
  try {
    const { departmentCode, status, priority, assignedTo } = req.query;
    const params = [];
    const where = [];
    if (departmentCode) {
      params.push(departmentCode);
      where.push(`department_id = (SELECT id FROM departments WHERE code=$${params.length})`);
    }
    if (status) { params.push(status); where.push(`status=$${params.length}`); }
    if (priority) { params.push(priority); where.push(`priority=$${params.length}`); }
    if (assignedTo) { params.push(Number(assignedTo)); where.push(`assigned_to=$${params.length}`); }

    const sql = `
      SELECT t.*
      FROM tickets t
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY t.created_at DESC
      LIMIT 200
    `;
    const r = await pool.query(sql, params);
    try { await audit(req, { action: "admin_ticket_list", entityType: null, entityId: null, meta: { departmentCode: departmentCode || null, status: status || null, priority: priority || null, assignedTo: assignedTo || null } }); } catch {}
    res.json({ ok: true, tickets: r.rows });
  } catch (e) { next(e); }
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved", "rejected"]),
    note: z.string().max(500).optional()
  })
});

router.patch("/tickets/:id/status", requireAuth, requireRole(["admin", "supervisor", "clerk"]), validate(updateStatusSchema), async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const { status, note } = req.body || {};
    if (!status) return res.status(400).json({ error: "status required" });

    const ticket = await pool.query("SELECT id, user_id, status FROM tickets WHERE id=$1", [ticketId]);
    if (!ticket.rowCount) return res.status(404).json({ error: "Ticket not found" });
    const from = ticket.rows[0].status;
    const to = status;

    if (!allowedStatuses.has(to)) return res.status(400).json({ error: "Invalid status" });
    if (!canTransition(from, to)) return res.status(400).json({ error: `Invalid transition ${from} -> ${to}` });

    const r = await pool.query(
      `UPDATE tickets 
       SET status=$1, 
           updated_at=NOW(),
           resolved_at = CASE WHEN $1='resolved' THEN NOW() ELSE resolved_at END
       WHERE id=$2 RETURNING *`,
      [to, ticketId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });

    await pool.query(
      `INSERT INTO ticket_updates (ticket_id, status, note, updated_by)
       VALUES ($1,$2,$3,$4)`,
      [ticketId, to, note || null, req.user.id]
    );

    try {
      await notify(ticket.rows[0].user_id, {
        type: "ticket_status",
        title: "Ticket status updated",
        message: `Your ticket #${ticketId} is now ${to}${note ? " — " + note : ""}`,
        entityType: "ticket",
        entityId: Number(ticketId)
      });
      await audit(req, {
        action: "status_update",
        entityType: "ticket",
        entityId: Number(ticketId),
        meta: { from, to, note: note || null }
      });
    } catch {}

    publish(ticketId, "status", { ticketId, status: to, note: note || null, updatedBy: req.user.id, at: new Date().toISOString() });
    res.json({ ok: true, ticket: r.rows[0] });
  } catch (e) { next(e); }
});

// Assign ticket to staff
const assignSchema = z.object({
  body: z.object({
    staffUserId: z.number().int()
  })
});

router.patch("/tickets/:id/assign", requireAuth, requireRole(["admin"]), validate(assignSchema), async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const { staffUserId } = req.body;

    const tRes = await pool.query("SELECT id, user_id FROM tickets WHERE id=$1", [ticketId]);
    if (tRes.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });
    const ticketOwnerId = tRes.rows[0].user_id;

    const staff = await pool.query("SELECT id, role FROM users WHERE id=$1", [staffUserId]);
    if (staff.rowCount === 0) return res.status(404).json({ error: "Staff user not found" });
    if (staff.rows[0].role !== "staff") return res.status(400).json({ error: "User is not staff" });

    const updated = await pool.query(
      `UPDATE tickets SET assigned_to=$1, updated_at=NOW() 
       WHERE id=$2 
       RETURNING *`,
      [staffUserId, ticketId]
    );
    if (updated.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });

    try {
      await audit(req, {
        action: "assign",
        entityType: "ticket",
        entityId: ticketId,
        meta: { assignedTo: staffUserId }
      });
      await notify(ticketOwnerId, {
        type: "ticket_assigned",
        title: "Ticket assigned",
        message: `Your ticket #${ticketId} has been assigned to staff`,
        entityType: "ticket",
        entityId: ticketId
      });
      await notify(staffUserId, {
        type: "ticket_assigned",
        title: "New assignment",
        message: `You have been assigned ticket #${ticketId}`,
        entityType: "ticket",
        entityId: ticketId
      });
    } catch {}

    publish(ticketId, "assigned", {
      ticketId,
      assignedTo: staffUserId,
      updatedBy: req.user.id,
      timestamp: new Date().toISOString()
    });

    res.json({ ticket: updated.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
