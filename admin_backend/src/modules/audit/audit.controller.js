const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const service = require("./audit.service");

const getAudit = asyncHandler(async (req, res) => {
  const r = await service.list(req.query || {});
  res.json(r);
});

function isValidDate(s) {
  if (!s) return true;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

const getLogs = asyncHandler(async (req, res) => {
  if (req.user?.role !== "admin") {
    throw new ApiError("Forbidden", 403, "FORBIDDEN");
  }
  const { from, to, actor_id, action, department_id, limit } = req.query || {};
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError("Invalid date range", 400, "VALIDATION_ERROR");
  }
  if (limit !== undefined) {
    const n = parseInt(limit, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) {
      throw new ApiError("Invalid limit", 400, "VALIDATION_ERROR");
    }
  }
  const r = await service.queryLogs({ from, to, actor_id, action, department_id, limit });
  res.json(r);
});

module.exports = { getAudit, getLogs };
