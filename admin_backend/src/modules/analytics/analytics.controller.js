const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const service = require("./analytics.service");

function isValidDate(s) {
  if (!s) return true;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

function ensureAnalyticsAccess(user) {
  if (user.role === "staff" || user.role === "unknown") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
}

const overview = asyncHandler(async (req, res) => {
  ensureAnalyticsAccess(req.user);
  const { from, to, departmentCode } = req.query || {};
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError("Invalid date range", 400, "VALIDATION_ERROR");
  }
  const r = await service.overview(req.user, { from, to, departmentCode });
  res.json(r);
});

const areas = asyncHandler(async (req, res) => {
  ensureAnalyticsAccess(req.user);
  const { from, to, departmentCode, top, status } = req.query || {};
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError("Invalid date range", 400, "VALIDATION_ERROR");
  }
  if (top !== undefined) {
    const n = parseInt(top, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) {
      throw new ApiError("Invalid top", 400, "VALIDATION_ERROR");
    }
  }
  if (status && !["open", "in_progress", "resolved", "rejected"].includes(status)) {
    throw new ApiError("Invalid status", 400, "VALIDATION_ERROR");
  }
  const r = await service.areas(req.user, { from, to, departmentCode, top, status });
  res.json(r);
});

const hotspots = asyncHandler(async (req, res) => {
  ensureAnalyticsAccess(req.user);
  const { from, to, departmentCode, top, status } = req.query || {};
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError("Invalid date range", 400, "VALIDATION_ERROR");
  }
  if (top !== undefined) {
    const n = parseInt(top, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) {
      throw new ApiError("Invalid top", 400, "VALIDATION_ERROR");
    }
  }
  if (status && !["open", "in_progress", "resolved", "rejected"].includes(status)) {
    throw new ApiError("Invalid status", 400, "VALIDATION_ERROR");
  }
  const r = await service.hotspots(req.user, { from, to, departmentCode, top, status });
  res.json(r);
});

module.exports = { overview, areas, hotspots };
