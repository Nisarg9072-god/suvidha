const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");
const metrics = require("../utils/metrics");

function buildSslConfig() {
  const forceSsl =
    process.env.PGSSLMODE === "require" ||
    process.env.DB_SSL === "true" ||
    env.NODE_ENV === "production";

  if (!forceSsl) return undefined;
  return { rejectUnauthorized: false };
}

function createPool() {
  const ssl = buildSslConfig();

  if (env.DATABASE_URL) {
    return new Pool({
      connectionString: env.DATABASE_URL,
      ssl
    });
  }

  return new Pool({
    host: env.PGHOST,
    port: env.PGPORT ? parseInt(env.PGPORT, 10) : undefined,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    ssl
  });
}

const pool = createPool();

module.exports = {
  pool,
  query: async (text, params) => {
    const start = process.hrtime.bigint();
    try {
      const res = await pool.query(text, params);
      const end = process.hrtime.bigint();
      const durationMs = Number((end - start) / BigInt(1_000_000));
      if (durationMs > 300) {
        try {
          const payload = { durationMs };
          if (env.NODE_ENV !== "production") {
            payload.sql = String(text).slice(0, 500);
          }
          logger.warn("slow_query", payload);
          try { metrics.incSlowQuery(); } catch (e) {}
        } catch (e) {}
      }
      return res;
    } catch (e) {
      const end = process.hrtime.bigint();
      const durationMs = Number((end - start) / BigInt(1_000_000));
      try {
        logger.error("query_error", { durationMs, msg: e?.message });
      } catch (_) {}
      throw e;
    }
  }
};