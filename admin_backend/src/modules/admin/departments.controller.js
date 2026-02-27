const asyncHandler = require("../../utils/asyncHandler");
const service = require("./departments.service");

const getDepartments = asyncHandler(async (req, res) => {
  const r = await service.list();
  res.json(r);
});

module.exports = { getDepartments };
