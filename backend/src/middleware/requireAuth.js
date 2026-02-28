
const { verifyToken } = require("../utils/jwt");
const { pool } = require("../db");
const crypto = require("crypto");

async function requireAuth(req, res, next) {
  let token = "";
  const header = req.headers.authorization || "";
  
  if (header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.query.token) {
    // Also allow token in query parameter for EventSource (SSE)
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, phone, role }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const r = await pool.query(
      `SELECT revoked FROM user_sessions WHERE user_id=$1 AND token_hash=$2`,
      [decoded.id, tokenHash]
    );
    if (r.rowCount === 0) {
      return res.status(401).json({ error: "Session not found" });
    }
    if (r.rows[0].revoked) {
      return res.status(401).json({ error: "Token revoked" });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

module.exports = { requireAuth };
