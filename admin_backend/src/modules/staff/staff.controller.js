const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const service = require("./staff.service");

const getStaff = asyncHandler(async (req, res) => {
  try {
    const r = await service.list(req.user);
    res.json(r);
  } catch (e) {
    if (e.message === "FORBIDDEN_STAFF_LIST") {
      throw new ApiError("Forbidden", 403, "FORBIDDEN");
    }
    throw e;
  }
});

const addStaff = asyncHandler(async (req, res) => {
  const { name, phone, departmentCode } = req.body || {};
  if (!phone) throw new ApiError("phone required", 400, "VALIDATION_ERROR");
  try {
    const r = await service.create(req.user, { name, phone, departmentCode });
    res.status(201).json({ ok: true, staffId: r.id });
  } catch (e) {
    if (e.message === "FORBIDDEN_STAFF_CREATE") {
      throw new ApiError("Forbidden", 403, "FORBIDDEN");
    }
    throw e;
  }
});

module.exports = { getStaff, addStaff };
