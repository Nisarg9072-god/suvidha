const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");
const metrics = require("../utils/metrics");

console.log("ADMIN DATABASE URL:", process.env.DATABASE_URL);

function createPool() {
  if (env.DATABASE_URL) {
    return new Pool({ connectionString: env.DATABASE_URL });
  }
  return new Pool({
    host: env.PGHOST,
    port: env.PGPORT ? parseInt(env.PGPORT, 10) : undefined,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE
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
