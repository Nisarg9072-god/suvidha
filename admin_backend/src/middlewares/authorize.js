const { ApiError } = require("../utils/errors");
const { ROLE_PERMISSIONS } = require("../config/permissions");

function authorize(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    const role = req.user.role || "unknown";
    const perms = ROLE_PERMISSIONS[role] || [];
    if (!perms.includes(permission)) {
      return next(new ApiError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  };
}

module.exports = { authorize };
