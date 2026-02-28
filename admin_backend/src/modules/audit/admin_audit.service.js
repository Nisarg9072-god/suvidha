const { query } = require("../../config/db");
const logger = require("../../utils/logger");

async function logAction({ actorId, actorRole, action, entityType, entityId, metadata }) {
  try {
    const metaJson = metadata ? JSON.stringify(metadata) : JSON.stringify({});
    await query(
      `INSERT INTO admin_audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [actorId, actorRole, action, entityType, entityId || null, metaJson]
    );
  } catch (e) {
    try { logger.error("admin_audit_insert_failed", { msg: e?.message }); } catch (_) {}
  }
}

async function list(params) {
  const where = [];
  const values = [];

  if (params.actor_id) {
    values.push(parseInt(params.actor_id, 10));
    where.push(`actor_id = $${values.length}`);
  }
  if (params.action) {
    values.push(params.action);
    where.push(`action = $${values.length}`);
  }
  if (params.entity_type) {
    values.push(params.entity_type);
    where.push(`entity_type = $${values.length}`);
  }
  if (params.from) {
    values.push(params.from);
    where.push(`created_at >= $${values.length}`);
  }
  if (params.to) {
    values.push(params.to);
    where.push(`created_at <= $${values.length}`);
  }

  const page = Math.max(parseInt(params.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(params.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { rows: items } = await query(
    `SELECT id, actor_id, actor_role, action, entity_type, entity_id, metadata, created_at
     FROM admin_audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  const { rows: [{ count }] } = await query(
    `SELECT COUNT(*)::bigint AS count FROM admin_audit_logs ${whereSql}`,
    values
  );

  return { ok: true, page, limit, total: parseInt(count, 10), items };
}

module.exports = { logAction, list };
