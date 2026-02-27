const crypto = require("crypto");

function requestId() {
  return (req, res, next) => {
    const incoming = req.headers["x-request-id"];
    const id = incoming && String(incoming).trim().length > 0 ? String(incoming).trim() : crypto.randomUUID();
    req.requestId = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}

module.exports = requestId;
