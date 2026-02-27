const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const svc = require("./tickets.service");

const list = asyncHandler(async (req, res) => {
  const r = await svc.listTickets(req.user, req.query || {});
  res.json(r);
});

const detail = asyncHandler(async (req, res) => {
  const r = await svc.getTicketDetail(req.user, req.params.id);
  res.json(r);
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
