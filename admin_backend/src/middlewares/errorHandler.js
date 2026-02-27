const { ApiError } = require("../utils/errors");

module.exports = (err, req, res, next) => {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const code = err instanceof ApiError ? err.code : "ERROR";
  const payload = {
    error: { message: err.message, code },
    requestId: req.requestId || null
  };
  if (process.env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
