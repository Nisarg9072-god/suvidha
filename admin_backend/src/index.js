const env = require("./config/env");
const app = require("./app");
const logger = require("./utils/logger");
const { pool } = require("./config/db");
const { shutdownStream, initAdminStream } = require("./modules/admin/admin.stream");
const runtime = require("./state/runtime");
const { randomUUID } = require("crypto");
const redisBus = require("./modules/admin/admin.redis");

const port = parseInt(process.env.PORT || env.PORT || "5001", 10);

const server = app.listen(port, () => {
  logger.info("admin backend up", { port });
});

runtime.setInstanceId(randomUUID());

try {
  Promise.resolve(initAdminStream())
    .then(() => {
      try { logger.info("admin stream initialized"); } catch (e) {}
    })
    .catch((e) => {
      try { logger.warn("admin stream init failed", { msg: e?.message }); } catch (_) {}
    });
} catch (e) {
  try { logger.warn("admin stream init threw", { msg: e?.message }); } catch (_) {}
}

async function gracefulShutdown(signal) {
  logger.info("shutdown initiated", { signal });
  runtime.setShuttingDown(true);
  const timeoutMs = 8000;
  const deadline = Date.now() + timeoutMs;
  try {
    await new Promise((resolve) => {
      try {
        server.close(() => {
          logger.info("http server closed");
          resolve();
        });
      } catch (e) {
        logger.error("http server close error", { msg: e?.message });
        resolve();
      }
    });
    try {
      shutdownStream();
      logger.info("sse stream closed");
    } catch (e) {
      logger.error("sse close error", { msg: e?.message });
    }
    try {
      if (redisBus && typeof redisBus.isEnabled === "function" && redisBus.isEnabled() && typeof redisBus.close === "function") {
        await redisBus.close();
        logger.info("redis clients closed");
      }
    } catch (e) {
      logger.warn("redis close error", { msg: e?.message });
    }
    try {
      await pool.end();
      logger.info("db pool closed");
    } catch (e) {
      logger.error("db pool close error", { msg: e?.message });
    }
  } catch (e) {
    logger.error("shutdown error", { msg: e?.message });
  } finally {
    if (Date.now() > deadline) {
      logger.warn("shutdown timeout reached, forcing exit");
    }
    logger.info("exit now");
    process.exit(0);
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

if (env.NODE_ENV === "production") {
  setInterval(() => {
    try {
      const mem = process.memoryUsage();
      const pressure = mem.heapTotal > 0 ? (mem.heapUsed / mem.heapTotal) : 0;
      if (pressure > 0.85) {
        logger.warn("memory_pressure", { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal });
      } else {
        logger.info("memory_usage", { rss: mem.rss, heapUsed: mem.heapUsed });
      }
    } catch (e) {}
  }, 60000).unref?.();
}
