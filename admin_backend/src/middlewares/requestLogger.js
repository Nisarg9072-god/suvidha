const logger = require("../utils/logger");

function requestLogger() {
  return (req, res, next) => {
    const path = req.originalUrl || req.url || "";
    if (path === "/health" || path.startsWith("/stream/admin/tickets")) {
      return next();
    }
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      try {
        const end = process.hrtime.bigint();
        const durationMs = Number((end - start) / BigInt(1_000_000));
        logger.info("request", {
          method: req.method,
          path,
          status: res.statusCode,
          durationMs,
          requestId: req.requestId || null,
          userId: req.user?.id || null,
          role: req.user?.role || null
        });
      } catch (e) {}
    });
    next();
  };
}

module.exports = requestLogger;
