const { Pool } = require("pg");
const env = require("./env");

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
  query: (text, params) => pool.query(text, params)
};
