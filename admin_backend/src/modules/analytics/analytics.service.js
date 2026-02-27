const { query } = require("../../config/db");

function parseRange(params) {
  const out = {};
  if (params.from) out.from = params.from;
  if (params.to) out.to = params.to;
  return out;
}
function buildFilters(user, params) {
  const where = [];
  const values = [];
  const range = parseRange(params);

  if (range.from) {
    values.push(range.from);
    where.push(`t.created_at >= $${values.length}`);
  }

  if (range.to) {
    values.push(range.to);
    where.push(`t.created_at <= $${values.length}`);
  }

  if (params.status) {
    values.push(params.status);
    where.push(`t.status = $${values.length}`);
  }

  if (user.role === "dept_admin" && user.department_id) {
    values.push(user.department_id);
    where.push(`t.department_id = $${values.length}`);
  } else if (params.departmentCode) {
    values.push(params.departmentCode);
    where.push(`d.code = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return { whereSql, values, range };
}

async function overview(user, params) {
  const { whereSql, values, range } = buildFilters(user, params);
  const sql = `
    SELECT
      COUNT(*)::bigint AS tickets_total,
      COUNT(*) FILTER (WHERE t.status = 'open')::bigint AS open,
      COUNT(*) FILTER (WHERE t.status = 'in_progress')::bigint AS in_progress,
      COUNT(*) FILTER (WHERE t.status = 'resolved')::bigint AS resolved,
      COUNT(*) FILTER (WHERE t.status = 'rejected')::bigint AS rejected,
      COUNT(*) FILTER (WHERE t.priority = 'EMERGENCY' OR COALESCE(t.is_emergency, false) = true)::bigint AS emergency_count,
      COUNT(*) FILTER (WHERE (t.resolved_at IS NULL AND t.sla_due_at IS NOT NULL AND t.sla_due_at < NOW())
                          OR (t.resolved_at IS NOT NULL AND t.sla_due_at IS NOT NULL AND t.resolved_at > t.sla_due_at))::bigint AS sla_breached_count,
      AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600.0) FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_hours
    FROM tickets t
    LEFT JOIN departments d ON d.id = t.department_id
    ${whereSql}
  `;
  const { rows } = await query(sql, values);
  const r = rows[0] || {};
  return {
    ok: true,
    range: { from: range.from || null, to: range.to || null },
    totals: {
      tickets_total: Number(r.tickets_total || 0),
      open: Number(r.open || 0),
      in_progress: Number(r.in_progress || 0),
      resolved: Number(r.resolved || 0),
      rejected: Number(r.rejected || 0),
      emergency_count: Number(r.emergency_count || 0),
      sla_breached_count: Number(r.sla_breached_count || 0),
      avg_resolution_hours: r.avg_resolution_hours !== null ? Number(r.avg_resolution_hours) : null
    }
  };
}

async function areas(user, params) {
  const top = Math.min(Math.max(parseInt(params.top || "20", 10), 1), 100);
  const { whereSql, values } = buildFilters(user, params);
  const sql = `
    SELECT
      COALESCE(t.area, 'Unknown') AS area,
      COUNT(*)::bigint AS total,
      COUNT(*) FILTER (WHERE t.status = 'open')::bigint AS open,
      COUNT(*) FILTER (WHERE t.status = 'in_progress')::bigint AS in_progress,
      COUNT(*) FILTER (WHERE t.status = 'resolved')::bigint AS resolved,
      COUNT(*) FILTER (WHERE t.status = 'rejected')::bigint AS rejected,
      COUNT(*) FILTER (WHERE t.priority = 'EMERGENCY' OR COALESCE(t.is_emergency, false) = true)::bigint AS emergency_count
    FROM tickets t
    LEFT JOIN departments d ON d.id = t.department_id
    ${whereSql}
    GROUP BY area
    ORDER BY total DESC
    LIMIT $${values.length + 1}
  `;
  const { rows } = await query(sql, [...values, top]);
  return { ok: true, items: rows };
}

async function hotspots(user, params) {
  const top = Math.min(Math.max(parseInt(params.top || "20", 10), 1), 100);
  const { whereSql, values } = buildFilters(user, params);
  const latLngFilter = `t.latitude IS NOT NULL AND t.longitude IS NOT NULL`;
  const whereWithLatLng = whereSql
  ? `${whereSql} AND ${latLngFilter}`
  : `WHERE ${latLngFilter}`;
  const sql = `
    SELECT
      ROUND(t.latitude::numeric, 2) AS lat_bucket,
      ROUND(t.longitude::numeric, 2) AS lng_bucket,
      COUNT(*)::bigint AS count,
      MAX(t.area) AS top_area,
      MAX(d.code) AS top_departmentCode,
      MIN(t.id) AS sample_ticket_id
    FROM tickets t
    LEFT JOIN departments d ON d.id = t.department_id
    ${whereWithLatLng}
    GROUP BY lat_bucket, lng_bucket
    ORDER BY count DESC
    LIMIT $${values.length + 1}
  `;
  const { rows } = await query(sql, [...values, top]);
  return { ok: true, items: rows };
}

module.exports = { overview, areas, hotspots };
