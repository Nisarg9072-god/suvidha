const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const svc = require("./tickets.service");

function mapStatusToFrontend(s) {
  switch (String(s || "").toLowerCase()) {
    case "open": return "Open";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    case "rejected": return "Rejected";
    default: return "Open";
  }
}

function mapPriorityToFrontend(p) {
  const v = String(p || "").toUpperCase();
  if (v === "LOW") return "Low";
  if (v === "MED" || v === "MEDIUM") return "Medium";
  if (v === "HIGH") return "High";
  if (v === "EMERGENCY") return "Emergency";
  return "Medium";
}

function mapDepartmentLabel(code) {
  const c = String(code || "").toUpperCase();
  if (c === "ELEC") return "Electricity";
  if (c === "GAS") return "Gas";
  if (c === "MUNI") return "Municipal";
  return c || "Other";
}

function mapListItemToFrontend(it) {
  return {
    id: it.id,
    citizenPhone: it.citizen_phone || "",
    department: mapDepartmentLabel(it.departmentCode),
    category: it.serviceType || "",
    priority: mapPriorityToFrontend(it.priority),
    status: mapStatusToFrontend(it.status),
    assignedStaff: it.assigned_to ? "Assigned" : "Unassigned",
    createdDate: it.created_at,
    slaDeadline: it.sla_due_at,
    description: "",
    location: it.area || ""
  };
}

function aliasStatusInput(s) {
  if (!s) return undefined;
  const v = String(s).toLowerCase();
  if (v === "progress" || v === "inprogress") return "in_progress";
  if (["open", "resolved", "rejected"].includes(v)) return v;
  return undefined;
}

function aliasPriorityInput(p) {
  if (!p) return undefined;
  const v = String(p).toLowerCase();
  if (v === "low") return "LOW";
  if (v === "medium" || v === "med") return "MED";
  if (v === "high") return "HIGH";
  if (v === "emergency") return "EMERGENCY";
  return undefined;
}

function aliasDepartmentInput(d) {
  if (!d) return undefined;
  const v = String(d).toLowerCase();
  if (["gas", "gas_department"].includes(v)) return "GAS";
  if (["electricity", "elec", "electric"].includes(v)) return "ELEC";
  if (["municipal", "muni", "municipality"].includes(v)) return "MUNI";
  // Accept codes directly
  const up = String(d).toUpperCase();
  if (["GAS", "ELEC", "MUNI"].includes(up)) return up;
  return undefined;
}

const list = asyncHandler(async (req, res) => {
  const q = req.query || {};
  const mappedQuery = { ...q };
  if (q.status) {
    const s = aliasStatusInput(q.status);
    if (s) mappedQuery.status = s; else delete mappedQuery.status;
  }
  if (q.priority) {
    const p = aliasPriorityInput(q.priority);
    if (p) mappedQuery.priority = p; else delete mappedQuery.priority;
  }
  // Allow department / departmentCode alias
  if (q.department && !q.departmentCode) {
    const d = aliasDepartmentInput(q.department);
    if (d) mappedQuery.departmentCode = d;
  }
  if (q.departmentCode) {
    const d = aliasDepartmentInput(q.departmentCode);
    if (d) mappedQuery.departmentCode = d; else delete mappedQuery.departmentCode;
  }

  const r = await svc.listTickets(req.user, mappedQuery);
  let items = Array.isArray(r.items) ? r.items : [];

  // Optional controller-level alias filter: overdue=true (SLA due in past)
  if (String(q.overdue || "").toLowerCase() === "true") {
    const now = Date.now();
    items = items.filter(it => {
      try {
        const due = new Date(it.sla_due_at).getTime();
        return Number.isFinite(due) && due < now;
      } catch (_) {
        return false;
      }
    });
  }

  const mapped = items.map(mapListItemToFrontend);
  const totalItems = (String(q.overdue || "").toLowerCase() === "true") ? mapped.length : r.total;
  const limit = r.limit || 20;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  res.json({
    tickets: mapped,
    totalPages,
    currentPage: r.page || 1,
    totalItems
  });
});

const detail = asyncHandler(async (req, res) => {
  const r = await svc.getTicketDetail(req.user, req.params.id);
  const t = r?.ticket || {};
  const mapped = {
    id: t.id,
    citizenPhone: t?.citizen?.phone || "",
    department: mapDepartmentLabel(t?.department?.code),
    category: t.service_type || "",
    priority: mapPriorityToFrontend(t.priority),
    status: mapStatusToFrontend(t.status),
    assignedStaff: t?.assigned_to?.id ? "Assigned" : "Unassigned",
    createdDate: t.created_at,
    slaDeadline: t.sla_due_at,
    description: t.description || "",
    location: t.area || ""
  };
  res.json({ ticket: mapped });
});

const patchStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body || {};
  if (!status || !["open", "in_progress", "resolved", "rejected"].includes(status)) {
    throw new ApiError("Invalid status", 400, "INVALID_STATUS");
  }
  const r = await svc.patchStatus(req.user, req.params.id, { status, reason }, { ip: req.ip, ua: req.headers["user-agent"] });
  res.json(r);
});

const patchAssign = asyncHandler(async (req, res) => {
  const { assigned_to } = req.body || {};
  const asg = parseInt(assigned_to, 10);
  if (!asg || Number.isNaN(asg)) {
    throw new ApiError("assigned_to required", 400, "INVALID_ASSIGNEE");
  }
  const r = await svc.patchAssign(req.user, req.params.id, { assigned_to: asg }, { ip: req.ip, ua: req.headers["user-agent"] });
  res.json(r);
});

const createWorkOrder = asyncHandler(async (req, res) => {
  const { title, description, due_at, priority } = req.body || {};
  if (!title || !description) {
    throw new ApiError("title and description required", 400, "INVALID_WORK_ORDER");
  }
  const r = await svc.createWorkOrder(req.user, req.params.id, { title, description, due_at, priority }, { ip: req.ip, ua: req.headers["user-agent"] });
  res.json(r);
});

const getUpdates = asyncHandler(async (req, res) => {
  const r = await svc.getUpdates(req.user, req.params.id);
  res.json(r);
});

const addUpdate = asyncHandler(async (req, res) => {
  const { message, visibility } = req.body || {};
  if (!message) throw new ApiError("message required", 400, "INVALID_UPDATE");
  if (visibility && !["internal", "citizen"].includes(visibility)) {
    throw new ApiError("invalid visibility", 400, "INVALID_UPDATE");
  }
  const r = await svc.addUpdate(req.user, req.params.id, { message, visibility }, { ip: req.ip, ua: req.headers["user-agent"] });
  res.json(r);
});

module.exports = {
  list,
  detail,
  patchStatus,
  patchAssign,
  createWorkOrder,
  getUpdates,
  addUpdate
};
