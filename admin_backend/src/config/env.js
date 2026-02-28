const dotenv = require("dotenv");
dotenv.config();

function mustString(name) {
  const v = process.env[name];
  if (!v || String(v).trim().length === 0) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(v).trim();
}

function mustInt(name) {
  const v = process.env[name];
  const n = v ? parseInt(v, 10) : NaN;
  if (Number.isNaN(n)) {
    throw new Error(`Invalid integer env: ${name}`);
  }
  return String(n);
}

const NODE_ENV = process.env.NODE_ENV || "development";

const env = {
  PORT: mustInt("PORT"),
  JWT_SECRET: mustString("JWT_SECRET"),
  DATABASE_URL: mustString("DATABASE_URL"),
  ADMIN_SSE_MAX_CLIENTS: process.env.ADMIN_SSE_MAX_CLIENTS ? parseInt(process.env.ADMIN_SSE_MAX_CLIENTS, 10) : 1000,
  ADMIN_SSE_DISTRIBUTED: process.env.ADMIN_SSE_DISTRIBUTED || "false",
  REDIS_URL: process.env.REDIS_URL,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  NODE_ENV
};

if (NODE_ENV === "production") {
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.trim() === "*" ) {
    throw new Error("CORS_ORIGIN must be set and not '*' in production");
  }
}

module.exports = env;
