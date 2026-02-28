const db = require("../db");

async function audit(req, { action, entityType = null, entityId = null, meta = {} }) {
  try {
    const actor = req.user || null;
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || null;
    const ua = req.headers["user-agent"] || null;

    await db.query(
      `INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, ip, user_agent, meta) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        actor?.id || null,
        actor?.role || null,
        action,
        entityType,
        entityId,
        ip,
        ua,
        meta
      ]
    );
  } catch {
  }
}

module.exports = { audit };

