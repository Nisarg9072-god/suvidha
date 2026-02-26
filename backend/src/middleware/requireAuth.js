
const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
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
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

module.exports = { requireAuth };