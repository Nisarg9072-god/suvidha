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

module.exports = { getStaff };
