const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { ApiError } = require("../utils/errors");

function pickId(p) {
  return p.userId ?? p.id ?? p.sub ?? p.user_id ?? null;
}

function pickRole(p) {
  return p.role ?? p.type ?? p.userRole ?? "unknown";
}

function pickDept(p) {
  return p.department_id ?? p.departmentId ?? p.dept_id ?? p.department ?? null;
}

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
  }
  try {
    const token = parts[1];
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: pickId(payload), role: pickRole(payload), department_id: pickDept(payload) };
    return next();
  } catch (e) {
    return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
  }
};
