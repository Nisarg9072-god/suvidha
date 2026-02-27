const asyncHandler = require("../../utils/asyncHandler");

const me = asyncHandler(async (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user?.id ?? null,
      role: req.user?.role ?? "unknown",
      department_id: req.user?.department_id ?? null
    }
  });
});

module.exports = { me };
