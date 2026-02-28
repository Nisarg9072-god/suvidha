const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { ApiError } = require("../utils/errors");
const { query } = require("../config/db");
const crypto = require("crypto");

function pickId(p) {
  return p.userId ?? p.id ?? p.sub ?? p.user_id ?? null;
}

function pickRole(p) {
  return p.role ?? p.type ?? p.userRole ?? "unknown";
}

function pickDept(p) {
  return p.department_id ?? p.departmentId ?? p.dept_id ?? p.department ?? null;
}

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
  }
  try {
    const token = parts[1];
    if (process.env.NODE_ENV !== "production") {
      try { console.log("ADMIN JWT SECRET LEN:", (env.JWT_SECRET || "").length); } catch (e) {}
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: pickId(payload), role: pickRole(payload), department_id: pickDept(payload) };
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const r = await query(`SELECT revoked FROM user_sessions WHERE user_id=$1 AND token_hash=$2`, [req.user.id, tokenHash]);
    if (r.rowCount === 0) {
      return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    if (r.rows[0].revoked) {
      return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    return next();
  } catch (e) {
    return next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
  }
};
