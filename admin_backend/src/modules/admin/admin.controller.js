const asyncHandler = require("../../utils/asyncHandler");
const service = require("./admin.service");

const ping = asyncHandler(async (req, res) => {
  const r = await service.ping();
  res.json(r);
});

module.exports = { ping };
