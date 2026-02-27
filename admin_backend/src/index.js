const env = require("./config/env");
const app = require("./app");
const logger = require("./utils/logger");
const { pool } = require("./config/db");
const { shutdownStream } = require("./modules/admin/admin.stream");

const server = app.listen(parseInt(env.PORT, 10), () => {
  logger.info("admin backend up", { port: env.PORT });
});

async function gracefulShutdown(signal) {
  try {
    logger.info("shutdown initiated", { signal });
    server.close(() => {
      logger.info("http server closed");
    });
    try {
      await pool.end();
      logger.info("db pool closed");
    } catch (e) {
      logger.error("db pool close error", { msg: e?.message });
    }
    try {
      shutdownStream();
      logger.info("sse stream closed");
    } catch (e) {
      logger.error("sse close error", { msg: e?.message });
    }
    logger.info("exit now");
    process.exit(0);
  } catch (e) {
    logger.error("shutdown error", { msg: e?.message });
    process.exit(0);
  }
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
