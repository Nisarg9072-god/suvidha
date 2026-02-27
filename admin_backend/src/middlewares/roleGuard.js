const { ApiError } = require("../utils/errors");

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    if (req.user.role !== role) {
      return next(new ApiError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  };
}

module.exports = { requireRole, requireAnyRole };
