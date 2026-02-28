const { query } = require("../../config/db");

async function list(params) {
  const where = [];
  const values = [];

  if (params.action) {
    values.push(params.action);
    where.push(`action = $${values.length}`);
  }

  if (params.entity_type) {
    values.push(params.entity_type);
    where.push(`entity_type = $${values.length}`);
  }

  if (params.actor_id) {
    values.push(parseInt(params.actor_id, 10));
    where.push(`actor_id = $${values.length}`);
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
    `SELECT id, actor_id, actor_role, action, entity_type, entity_id,
            department_id, metadata, ip_address, user_agent, created_at
     FROM audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  const { rows: [{ count }] } = await query(
    `SELECT COUNT(*)::bigint AS count FROM audit_logs ${whereSql}`,
    values
  );

  return {
    ok: true,
    page,
    limit,
    total: parseInt(count, 10),
    items
  };
}

async function logAction({ actor, action, entity_type, entity_id, department_id, metadata, req }) {
  try {
    const metaJson = metadata ? JSON.stringify(metadata) : JSON.stringify({});
    const ip = req?.ip || null;
    const ua = req?.headers?.["user-agent"] || null;
    await query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, department_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
      [actor.id, actor.role, action, entity_type, entity_id || null, department_id || null, metaJson, ip, ua]
    );
  } catch (e) {
  }
}

async function queryLogs(params) {
  const where = [];
  const values = [];
  if (params.from) {
    values.push(params.from);
    where.push(`created_at >= $${values.length}`);
  }
  if (params.to) {
    values.push(params.to);
    where.push(`created_at <= $${values.length}`);
  }
  if (params.actor_id) {
    values.push(parseInt(params.actor_id, 10));
    where.push(`actor_id = $${values.length}`);
  }
  if (params.action) {
    values.push(params.action);
    where.push(`action = $${values.length}`);
  }
  if (params.department_id) {
    values.push(parseInt(params.department_id, 10));
    where.push(`department_id = $${values.length}`);
  }
  const limit = Math.min(Math.max(parseInt(params.limit || "20", 10), 1), 100);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, actor_id, actor_role, action, entity_type, entity_id, department_id, metadata, ip_address, user_agent, created_at
     FROM audit_logs
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${values.length + 1}`,
    [...values, limit]
  );
  return { ok: true, items: rows };
}

module.exports = { list, logAction, queryLogs };
