const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/admin/audit", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { action, entityType, entityId, limit = 50 } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);

    const params = [];
    const where = [];

    if (action) { params.push(action); where.push(`action = $${params.length}`); }
    // admin_audit_logs may not have split entity type/id; filter on entire entity text if provided
    if (entityType) { params.push(entityType); where.push(`entity LIKE $${params.length}`); }
    if (entityId) { params.push(String(entityId)); where.push(`entity LIKE $${params.length}`); }

    const sql = `
      SELECT a.id,
             a.actor_id,
             u.role AS actor_role,
             a.action,
             a.entity,
             a.ip AS ip_address,
             a.created_at
      FROM admin_audit_logs a
      LEFT JOIN users u ON u.id = a.actor_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""} 
      ORDER BY created_at DESC 
      LIMIT ${lim}
    `;

    const r = await db.query(sql, params);
    // map entity into type/id if possible "type:id" or "type" format
    const items = r.rows.map((row) => {
      let entity_type = null;
      let entity_id = null;
      if (row.entity && typeof row.entity === "string") {
        const parts = row.entity.split(":");
        entity_type = parts[0] || null;
        entity_id = parts[1] ? Number(parts[1]) : null;
      }
      return {
        id: row.id,
        actor_id: row.actor_id,
        actor_role: row.actor_role || "admin",
        action: row.action,
        entity_type,
        entity_id,
        ip_address: row.ip_address,
        created_at: row.created_at
      };
    });
    res.json({ items, total: items.length });
  } catch (e) { next(e); }
});

module.exports = router;

