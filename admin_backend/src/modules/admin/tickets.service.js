const { query } = require("../../config/db");
const { ApiError } = require("../../utils/errors");
const { emitAdminEvent } = require("./admin.stream");
const { logAction } = require("../audit/audit.service");
const { logAction: logAdminAudit } = require("../audit/admin_audit.service");

function normalizePriority(p) {
  if (!p) return null;
  const map = { LOW: "LOW", MEDIUM: "MED", HIGH: "HIGH", EMERGENCY: "EMERGENCY" };
  const v = (p || "").toUpperCase();
  return map[v] || null;
}

function sortField(key) {
  switch (key) {
    case "priority": return "t.priority";
    case "sla_due_at": return "t.sla_due_at";
    default: return "t.created_at";
  }
}

async function listTickets(user, qparams) {
  const page = Math.max(parseInt(qparams.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(qparams.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;
  const sort = sortField(qparams.sort);
  const order = (qparams.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const where = [];
  const values = [];

  if (qparams.status) {
    values.push(qparams.status);
    where.push(`t.status = $${values.length}`);
  }
  if (qparams.departmentCode) {
    values.push(qparams.departmentCode);
    where.push(`d.code = $${values.length}`);
  }
  if (qparams.priority) {
    const p = normalizePriority(qparams.priority);
    if (p) {
      values.push(p);
      where.push(`t.priority = $${values.length}`);
    }
  }
  if (qparams.area) {
    values.push(`%${qparams.area}%`);
    where.push(`t.area ILIKE $${values.length}`);
  }
  if (qparams.assigned_to) {
    values.push(parseInt(qparams.assigned_to, 10));
    where.push(`t.assigned_to = $${values.length}`);
  }
  if (qparams.q) {
    const term = `%${qparams.q}%`;
    values.push(term);
    where.push(`(t.title ILIKE $${values.length} OR t.description ILIKE $${values.length} OR t.area ILIKE $${values.length})`);
    values.push(term);
    where.push(`(u.phone ILIKE $${values.length})`);
    const maybeId = parseInt(qparams.q, 10);
    if (!Number.isNaN(maybeId)) {
      values.push(maybeId);
      where.push(`t.id = $${values.length}`);
    }
  }

  // role-based visibility
  if (user.role === "dept_admin" && user.department_id) {
    values.push(user.department_id);
    where.push(`t.department_id = $${values.length}`);
  } else if (user.role === "staff") {
    values.push(user.id);
    const idxStaff = values.length;
    values.push(user.id);
    const idxDeptUser = values.length;
    where.push(`(t.assigned_to = $${idxStaff} OR t.department_id IN (SELECT department_id FROM user_departments WHERE user_id = $${idxDeptUser}))`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const mainSql = `
    SELECT t.id, d.code AS departmentCode, t.service_type AS serviceType, t.priority, t.status, t.area,
           t.created_at, t.sla_due_at, t.assigned_to, u.phone AS citizen_phone
    FROM tickets t
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN departments d ON d.id = t.department_id
    ${whereSql}
    ORDER BY ${sort} ${order}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  const countSql = `
    SELECT COUNT(*)::bigint AS count
    FROM tickets t
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN departments d ON d.id = t.department_id
    ${whereSql}
  `;
  const { rows: items } = await query(mainSql, [...values, limit, offset]);
  const { rows: [{ count }] } = await query(countSql, values);
  const mapped = items.map(it => ({
    id: it.id,
    ticket_no: `TKT-${it.id}`,
    departmentCode: it.departmentCode,
    serviceType: it.serviceType,
    priority: it.priority,
    status: it.status,
    area: it.area,
    created_at: it.created_at,
    sla_due_at: it.sla_due_at,
    assigned_to: it.assigned_to,
    citizen_phone: it.citizen_phone
  }));
  return { ok: true, page, limit, total: parseInt(count, 10), items: mapped };
}

async function canViewTicket(user, ticketId) {
  if (user.role === "admin") return true;
  if (user.role === "dept_admin") {
    const { rows } = await query(`SELECT 1 FROM tickets WHERE id=$1 AND department_id=$2`, [ticketId, user.department_id]);
    return rows.length > 0;
  }
  if (user.role === "staff") {
    const { rows } = await query(
      `SELECT 1 FROM tickets WHERE id=$1 AND (assigned_to=$2 OR department_id IN (SELECT department_id FROM user_departments WHERE user_id=$2))`,
      [ticketId, user.id]
    );
    return rows.length > 0;
  }
  return false;
}

async function getTicketDetail(user, id) {
  const tid = parseInt(id, 10);
  const can = await canViewTicket(user, tid);
  if (!can) throw new ApiError("Forbidden", 403, "FORBIDDEN");
  const { rows: trows } = await query(
    `SELECT t.*, u.name AS citizen_name, u.phone AS citizen_phone, d.code AS department_code, d.name AS department_name,
            a.name AS assigned_name, a.phone AS assigned_phone
     FROM tickets t
     LEFT JOIN users u ON u.id = t.user_id
     LEFT JOIN departments d ON d.id = t.department_id
     LEFT JOIN users a ON a.id = t.assigned_to
     WHERE t.id=$1`,
    [tid]
  );
  if (trows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  const ticket = trows[0];
  const { rows: attachments } = await query(
    `SELECT id, original_name, mime_type, size_bytes, created_at FROM ticket_attachments WHERE ticket_id=$1 ORDER BY created_at DESC`,
    [tid]
  );
  const { rows: updates } = await query(
    `SELECT id, status, note, updated_by, created_at FROM ticket_updates WHERE ticket_id=$1 ORDER BY created_at DESC`,
    [tid]
  );
  return {
    ok: true,
    ticket: {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      service_type: ticket.service_type,
      department: { id: ticket.department_id, code: ticket.department_code, name: ticket.department_name },
      area: ticket.area,
      sla_due_at: ticket.sla_due_at,
      resolved_at: ticket.resolved_at,
      created_at: ticket.created_at,
      citizen: { id: ticket.user_id, name: ticket.citizen_name, phone: ticket.citizen_phone },
      assigned_to: ticket.assigned_to ? { id: ticket.assigned_to, name: ticket.assigned_name, phone: ticket.assigned_phone } : null
    },
    attachments,
    updates
  };
}

function isValidTransition(from, to) {
  const allowed = {
    open: ["in_progress", "resolved", "rejected"],
    in_progress: ["resolved", "rejected"],
    resolved: [],
    rejected: []
  };
  return (allowed[from] || []).includes(to);
}

async function patchStatus(user, id, body, actorMeta) {
  const tid = parseInt(id, 10);
  const { rows: guardRows } = await query(`SELECT department_id, assigned_to, status FROM tickets WHERE id=$1`, [tid]);
  if (guardRows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  if (user.role === "staff" && guardRows[0].assigned_to !== user.id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  if (user.role === "dept_admin" && user.department_id && guardRows[0].department_id !== user.department_id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  const { rows: curRows } = await query(`SELECT status FROM tickets WHERE id=$1`, [tid]);
  if (curRows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  const from = curRows[0].status;
  const to = body.status;
  if (!isValidTransition(from, to)) {
    throw new ApiError("Invalid status transition", 400, "INVALID_STATUS_TRANSITION");
  }
  const setResolved = to === "resolved";
  await query(
    `UPDATE tickets SET status=$1, resolved_at = CASE WHEN $2 THEN NOW() ELSE resolved_at END WHERE id=$3`,
    [to, setResolved, tid]
  );
  await query(
    `INSERT INTO ticket_updates (ticket_id, status, note, updated_by) VALUES ($1, $2, $3, $4)`,
    [tid, to, body.reason || null, user.id]
  );
  if (to === "resolved") {
    try {
      const { rows: ownerRows } = await query(`SELECT user_id FROM tickets WHERE id=$1`, [tid]);
      if (ownerRows.length) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
           VALUES ($1,'ticket_update','Ticket completed','Your ticket has been marked as completed','ticket',$2)`,
          [ownerRows[0].user_id, tid]
        );
        await query(
          `UPDATE user_sessions SET revoked=TRUE, revoked_by=$1, revoked_at=NOW() WHERE user_id=$2 AND revoked=FALSE`,
          [user.id, ownerRows[0].user_id]
        );
        await query(
          `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
           VALUES ($1,'token_revoked','Session closed','Your session has been closed after completion','token',$2)`,
          [ownerRows[0].user_id, tid]
        );
      }
    } catch (e) {}
  }
  await query(
    `INSERT INTO ticket_events (ticket_id, action_type, performed_by, note) VALUES ($1,$2,$3,$4)`,
    [tid, 'status_changed', user.id, body.reason || null]
  );
  try {
    const { rows: ownerRows } = await query(`SELECT user_id FROM tickets WHERE id=$1`, [tid]);
    if (ownerRows.length) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
         VALUES ($1,'ticket_update','Ticket status updated',$2,'ticket',$3)`,
        [ownerRows[0].user_id, `Your ticket #${tid} is now ${to}`, tid]
      );
    }
  } catch (e) {}
  try {
    await logAdminAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "TICKET_STATUS_UPDATED",
      entityType: "ticket",
      entityId: tid,
      metadata: { previousStatus: from, newStatus: to, reason: body.reason || null }
    });
  } catch (e) {}
  await logAction({
    actor: { id: user.id, role: user.role },
    action: "ticket_status_changed",
    entity_type: "ticket",
    entity_id: tid,
    department_id: null,
    metadata: { fromStatus: from, toStatus: to, reason: body.reason || null, actor: actorMeta },
    req: { ip: actorMeta?.ip, headers: { "user-agent": actorMeta?.ua } }
  });
  const { rows: metaRows } = await query(`SELECT department_id, assigned_to, NOW() as updated_at FROM tickets WHERE id=$1`, [tid]);
  const { rows } = await query(
    `SELECT t.id, d.code AS departmentCode, t.service_type AS serviceType, t.priority, t.status, t.area,
            t.created_at, t.sla_due_at, t.assigned_to, u.phone AS citizen_phone
     FROM tickets t
     LEFT JOIN users u ON u.id = t.user_id
     LEFT JOIN departments d ON d.id = t.department_id
     WHERE t.id=$1`,
    [tid]
  );
  const it = rows[0];
  emitAdminEvent("ticket_status", {
    ticketId: tid,
    fromStatus: from,
    toStatus: to,
    department_id: metaRows[0].department_id,
    assigned_to: metaRows[0].assigned_to,
    updatedAt: metaRows[0].updated_at
  });
  return {
    ok: true,
    item: {
      id: it.id,
      ticket_no: `TKT-${it.id}`,
      departmentCode: it.departmentCode,
      serviceType: it.serviceType,
      priority: it.priority,
      status: it.status,
      area: it.area,
      created_at: it.created_at,
      sla_due_at: it.sla_due_at,
      assigned_to: it.assigned_to,
      citizen_phone: it.citizen_phone
    }
  };
}

async function patchAssign(user, id, body, actorMeta) {
  const tid = parseInt(id, 10);
  const can = await canViewTicket(user, tid);
  if (!can) throw new ApiError("Forbidden", 403, "FORBIDDEN");
  if (user.role === "staff") throw new ApiError("Forbidden", 403, "FORBIDDEN");
  const assignedTo = parseInt(body.assigned_to, 10);
  const { rows: staffRows } = await query(`SELECT id, role FROM users WHERE id=$1`, [assignedTo]);
  if (staffRows.length === 0 || staffRows[0].role !== "staff") {
    throw new ApiError("assigned_to must be a staff user", 400, "INVALID_ASSIGNEE");
  }
  if (user.role === "dept_admin") {
    const { rows: actorDept } = await query(`SELECT department_id FROM user_departments WHERE user_id=$1`, [user.id]);
    const { rows: staffDept } = await query(`SELECT department_id FROM user_departments WHERE user_id=$1`, [assignedTo]);
    if (actorDept.length === 0 || staffDept.length === 0 || actorDept[0].department_id !== staffDept[0].department_id) {
      throw new ApiError("Cross-department assignment not allowed", 403, "FORBIDDEN");
    }
  }
  const { rows: current } = await query(`SELECT status FROM tickets WHERE id=$1`, [tid]);
  if (current.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  const curStatus = current[0].status;
  const nextStatus = curStatus === "open" ? "in_progress" : curStatus;
  await query(`UPDATE tickets SET assigned_to=$1, status=$2 WHERE id=$3`, [assignedTo, nextStatus, tid]);
  await query(
    `INSERT INTO ticket_updates (ticket_id, status, note, updated_by) VALUES ($1, $2, $3, $4)`,
    [tid, nextStatus, `assigned_to:${assignedTo}`, user.id]
  );
  await query(
    `INSERT INTO ticket_events (ticket_id, action_type, performed_by, note) VALUES ($1,$2,$3,$4)`,
    [tid, 'assigned', user.id, `assigned_to:${assignedTo}`]
  );
  try {
    const { rows: ownerRows } = await query(`SELECT user_id FROM tickets WHERE id=$1`, [tid]);
    if (ownerRows.length) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
         VALUES ($1,'assignment','Ticket assigned','Your ticket has been assigned','ticket',$2)`,
        [ownerRows[0].user_id, tid]
      );
    }
  } catch (e) {}
  try {
    await logAdminAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "TICKET_ASSIGNED",
      entityType: "ticket",
      entityId: tid,
      metadata: { assignedFrom: null, assignedTo: assignedTo }
    });
  } catch (e) {}
  await logAction({
    actor: { id: user.id, role: user.role },
    action: "ticket_assigned",
    entity_type: "ticket",
    entity_id: tid,
    department_id: null,
    metadata: { assigned_to: assignedTo, actor: actorMeta },
    req: { ip: actorMeta?.ip, headers: { "user-agent": actorMeta?.ua } }
  });
  const { rows: metaRows } = await query(`SELECT department_id, assigned_to, NOW() as updated_at FROM tickets WHERE id=$1`, [tid]);
  const { rows } = await query(
    `SELECT t.id, d.code AS departmentCode, t.service_type AS serviceType, t.priority, t.status, t.area,
            t.created_at, t.sla_due_at, t.assigned_to, u.phone AS citizen_phone
     FROM tickets t
     LEFT JOIN users u ON u.id = t.user_id
     LEFT JOIN departments d ON d.id = t.department_id
     WHERE t.id=$1`,
    [tid]
  );
  const it = rows[0];
  emitAdminEvent("ticket_assigned", {
    ticketId: tid,
    assigned_to: metaRows[0].assigned_to,
    department_id: metaRows[0].department_id,
    updatedAt: metaRows[0].updated_at
  });
  return {
    ok: true,
    item: {
      id: it.id,
      ticket_no: `TKT-${it.id}`,
      departmentCode: it.departmentCode,
      serviceType: it.serviceType,
      priority: it.priority,
      status: it.status,
      area: it.area,
      created_at: it.created_at,
      sla_due_at: it.sla_due_at,
      assigned_to: it.assigned_to,
      citizen_phone: it.citizen_phone
    }
  };
}

async function createWorkOrder(user, id, body, actorMeta) {
  const tid = parseInt(id, 10);
  const { rows: guardRows } = await query(`SELECT department_id, assigned_to FROM tickets WHERE id=$1`, [tid]);
  if (guardRows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  if (user.role === "staff" && guardRows[0].assigned_to !== user.id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  if (user.role === "dept_admin" && user.department_id && guardRows[0].department_id !== user.department_id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  const notes = JSON.stringify({
    title: body.title,
    description: body.description,
    due_at: body.due_at || null,
    priority: body.priority || null
  });
  const { rows } = await query(
    `INSERT INTO work_orders (ticket_id, status, notes) VALUES ($1, 'assigned', $2) RETURNING id, ticket_id, status, notes, created_at, updated_at`,
    [tid, notes]
  );
  try {
    await logAdminAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "WORK_ORDER_CREATED",
      entityType: "ticket",
      entityId: tid,
      metadata: { work_order_id: rows[0].id, title: body.title, priority: body.priority || null }
    });
  } catch (e) {}
  await logAction({
    actor: { id: user.id, role: user.role },
    action: "work_order_created",
    entity_type: "ticket",
    entity_id: tid,
    department_id: null,
    metadata: { work_order_id: rows[0].id, payload: body, actor: actorMeta },
    req: { ip: actorMeta?.ip, headers: { "user-agent": actorMeta?.ua } }
  });
  const { rows: metaRows } = await query(`SELECT department_id, assigned_to FROM tickets WHERE id=$1`, [tid]);
  const wo = rows[0];
  let parsed = {};
  try { parsed = JSON.parse(wo.notes); } catch (e) {}
  const out = { ok: true, work_order: { id: wo.id, ticket_id: wo.ticket_id, status: wo.status, created_at: wo.created_at, updated_at: wo.updated_at, ...parsed } };
  emitAdminEvent("work_order_created", {
    ticketId: tid,
    workOrderId: wo.id,
    department_id: metaRows[0].department_id,
    assigned_to: metaRows[0].assigned_to,
    createdAt: wo.created_at
  });
  return out;
}

async function getUpdates(user, id) {
  const tid = parseInt(id, 10);
  const can = await canViewTicket(user, tid);
  if (!can) throw new ApiError("Forbidden", 403, "FORBIDDEN");
  const { rows } = await query(
    `SELECT id, status, note, updated_by, created_at FROM ticket_updates WHERE ticket_id=$1 ORDER BY created_at DESC`,
    [tid]
  );
  return { ok: true, items: rows };
}

async function addUpdate(user, id, body, actorMeta) {
  const tid = parseInt(id, 10);
  const { rows: guardRows } = await query(`SELECT department_id, assigned_to, status, user_id FROM tickets WHERE id=$1`, [tid]);
  if (guardRows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  if (user.role === "staff" && guardRows[0].assigned_to !== user.id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  if (user.role === "dept_admin" && user.department_id && guardRows[0].department_id !== user.department_id) {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  const curStatus = guardRows[0].status;
  await query(
    `INSERT INTO ticket_updates (ticket_id, status, note, updated_by) VALUES ($1, $2, $3, $4)`,
    [tid, curStatus, body.message, user.id]
  );
  try {
    await logAdminAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "TICKET_INTERNAL_NOTE_ADDED",
      entityType: "ticket",
      entityId: tid,
      metadata: { visibility: body.visibility || "internal" }
    });
  } catch (e) {}
  await logAction({
    actor: { id: user.id, role: user.role },
    action: "ticket_update_added",
    entity_type: "ticket",
    entity_id: tid,
    department_id: null,
    metadata: { visibility: body.visibility, actor: actorMeta },
    req: { ip: actorMeta?.ip, headers: { "user-agent": actorMeta?.ua } }
  });
  const { rows: metaRows } = await query(`SELECT department_id, assigned_to, NOW() as created_at FROM tickets WHERE id=$1`, [tid]);
  if (body.visibility === "citizen") {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
       VALUES ($1, 'ticket_update', 'Update on ticket', $2, 'ticket', $3)`,
      [guardRows[0].user_id, body.message, tid]
    );
  }
  emitAdminEvent("ticket_update", {
    ticketId: tid,
    visibility: body.visibility || "internal",
    department_id: metaRows[0].department_id,
    assigned_to: metaRows[0].assigned_to,
    createdAt: metaRows[0].created_at
  });
  return { ok: true };
}

module.exports = {
  listTickets,
  getTicketDetail,
  patchStatus,
  patchAssign,
  createWorkOrder,
  getUpdates,
  addUpdate
};
