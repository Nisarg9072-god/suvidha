const { ApiError } = require("./errors");

function isPositiveInt(v) {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 0;
}

function isIsoDate(v) {
  if (!v) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

function error(message) {
  return new ApiError(message || "Validation error", 400, "VALIDATION_ERROR");
}

function validateParamId(req, res, next) {
  const { id } = req.params || {};
  if (!isPositiveInt(id)) return next(error("Invalid id"));
  return next();
}

function validateStatusBody(req, res, next) {
  const { status, reason } = req.body || {};
  const allowed = ["open", "in_progress", "resolved", "rejected"];
  if (!status || !allowed.includes(status)) return next(error("Invalid status"));
  if (reason !== undefined && typeof reason !== "string") return next(error("Invalid reason"));
  return next();
}

function validateAssignBody(req, res, next) {
  const { assigned_to } = req.body || {};
  if (!isPositiveInt(assigned_to)) return next(error("assigned_to must be a positive integer"));
  return next();
}

function validateWorkOrderBody(req, res, next) {
  const { title, description, due_at, priority } = req.body || {};
  if (!title || typeof title !== "string") return next(error("title is required"));
  if (description !== undefined && typeof description !== "string") return next(error("Invalid description"));
  if (due_at !== undefined && due_at !== null && !isIsoDate(due_at)) return next(error("Invalid due_at"));
  const allowed = ["LOW", "MED", "MEDIUM", "HIGH", "EMERGENCY"];
  if (priority !== undefined && priority !== null && !allowed.includes(String(priority).toUpperCase())) {
    return next(error("Invalid priority"));
  }
  return next();
}

function validateUpdateBody(req, res, next) {
  const { message, visibility } = req.body || {};
  if (!message || typeof message !== "string") return next(error("message is required"));
  if (visibility !== undefined && !["internal", "citizen"].includes(visibility)) {
    return next(error("Invalid visibility"));
  }
  return next();
}

function validateAnalyticsQuery(req, res, next) {
  const { from, to, top, status, departmentCode } = req.query || {};
  if (from && !isIsoDate(from)) return next(error("Invalid from"));
  if (to && !isIsoDate(to)) return next(error("Invalid to"));
  if (top !== undefined) {
    const n = parseInt(top, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) return next(error("Invalid top"));
  }
  if (status && !["open", "in_progress", "resolved", "rejected"].includes(status)) {
    return next(error("Invalid status"));
  }
  if (departmentCode && !["GAS", "ELEC", "MUNI"].includes(departmentCode)) {
    return next(error("Invalid departmentCode"));
  }
  return next();
}

module.exports = {
  validateParamId,
  validateStatusBody,
  validateAssignBody,
  validateWorkOrderBody,
  validateUpdateBody,
  validateAnalyticsQuery
};
