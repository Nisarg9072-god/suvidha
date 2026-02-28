const { Pool } = require("pg");

function buildSslConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const forceSsl =
    process.env.PGSSLMODE === "require" ||
    process.env.DB_SSL === "true" ||
    nodeEnv === "production";

  if (!forceSsl) return undefined;

  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: buildSslConfig()
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};