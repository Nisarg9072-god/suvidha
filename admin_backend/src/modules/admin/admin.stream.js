const { query } = require("../../config/db");
const env = require("../../config/env");
const runtime = require("../../state/runtime");
const metrics = require("../../utils/metrics");
const redisBus = require("./admin.redis");

let seq = 0;
const clients = new Map();
const maxClients = Number(env.ADMIN_SSE_MAX_CLIENTS || 1000);

function nextId() {
  seq += 1;
  return `${Date.now()}-${seq}`;
}

function safeWrite(res, type, data) {
  const id = nextId();
  let payload = "{}";
  try {
    payload = JSON.stringify(data);
  } catch (e) {
    payload = "{}";
  }
  res.write(`id: ${id}\n`);
  res.write(`event: ${type}\n`);
  res.write(`data: ${payload}\n\n`);
}

function addClient(res, user) {
  if (runtime.getShuttingDown()) {
    return null;
  }
  if (clients.size >= maxClients) {
    return null;
  }
  const id = nextId();
  clients.set(id, { res, user, connectedAt: Date.now() });
  try { metrics.setSseClients(clients.size); } catch (e) {}
  return id;
}

function removeClient(id) {
  clients.delete(id);
  try { metrics.setSseClients(clients.size); } catch (e) {}
}

function shouldReceive(client, meta) {
  const role = client.user.role;
  if (role === "admin") return true;
  const depId = client.user.department_id || null;
  const assignedId = client.user.id;
  const tDep = meta.department_id || null;
  const tAssigned = meta.assigned_to || null;
  if (role === "dept_admin") {
    return depId && tDep && depId === tDep;
  }
  if (role === "staff") {
    if (tAssigned && tAssigned === assignedId) return true;
    if (depId && tDep && depId === tDep) return true;
    return false;
  }
  return false;
}

function broadcastEvent(type, payload, scopeMeta) {
  const meta = scopeMeta || {};
  for (const [id, client] of clients.entries()) {
    try {
      if (shouldReceive(client, meta)) {
        safeWrite(client.res, type, payload);
      }
    } catch (e) {}
  }
}

function emitAdminEvent(type, payload) {
  const meta = {
    department_id: payload.department_id || null,
    assigned_to: payload.assigned_to || null
  };
  if (redisBus.isEnabled() && redisBus.isHealthy()) {
    redisBus.publishAdminEvent(type, payload);
  } else {
    broadcastEvent(type, payload, meta);
  }
  return true;
}

let pollLastSeen = null;
let pollBusy = false;
let pollInterval = null;
function startPollerIfEnabled() {
  if (env.ADMIN_SSE_POLL_NEW_TICKETS !== "true") return;
  pollLastSeen = new Date(Date.now() - 10000).toISOString();
  pollInterval = setInterval(async () => {
    if (pollBusy) return;
    pollBusy = true;
    try {
      const sql = `
        SELECT id, department_id, assigned_to, created_at
        FROM tickets
        WHERE created_at > $1
        ORDER BY created_at ASC
        LIMIT 50
      `;
      const { rows } = await query(sql, [pollLastSeen]);
      for (const r of rows) {
        emitAdminEvent("ticket_created", {
          ticketId: r.id,
          department_id: r.department_id,
          assigned_to: r.assigned_to,
          createdAt: r.created_at
        });
        if (!pollLastSeen || r.created_at > pollLastSeen) {
          pollLastSeen = r.created_at;
        }
      }
    } catch (e) {
    } finally {
      pollBusy = false;
    }
  }, 3000);
}

function initAdminStream() {
  startPollerIfEnabled();
  try {
    redisBus.init().then(() => {
      redisBus.onAdminEvent((type, payload) => {
        const meta = { department_id: payload.department_id || null, assigned_to: payload.assigned_to || null };
        broadcastEvent(type, payload, meta);
      });
    }).catch(() => {});
  } catch (e) {}
  return { init: true };
}

function shutdownStream() {
  try {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    for (const [id, client] of clients.entries()) {
      try {
        client.res.end();
      } catch (e) {}
      clients.delete(id);
    }
    try { metrics.setSseClients(0); } catch (e) {}
  } catch (e) {}
}

function getClientCount() {
  try {
    return clients.size;
  } catch (e) {
    return 0;
  }
}

function isOverCapacity() {
  return clients.size >= maxClients;
}

module.exports = { initAdminStream, emitAdminEvent, addClient, removeClient, safeWrite, shutdownStream, getClientCount, isOverCapacity };
