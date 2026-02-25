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
    if (entityType) { params.push(entityType); where.push(`entity_type = $${params.length}`); }
    if (entityId) { params.push(Number(entityId)); where.push(`entity_id = $${params.length}`); }

    const sql = `
      SELECT id, actor_user_id, actor_role, action, entity_type, entity_id, ip, meta, created_at 
      FROM audit_logs 
      ${where.length ? "WHERE " + where.join(" AND ") : ""} 
      ORDER BY created_at DESC 
      LIMIT ${lim}
    `;

    const r = await db.query(sql, params);
    res.json({ logs: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

