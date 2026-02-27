const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const env = require("./config/env");
const { pool } = require("./config/db");
const { globalLimiter, authLimiter } = require("./middlewares/rateLimit");
const errorHandler = require("./middlewares/errorHandler");
const requestId = require("./middlewares/requestId");
const requestLogger = require("./middlewares/requestLogger");
const auth = require("./middlewares/auth");
const { requireAnyRole } = require("./middlewares/roleGuard");
const adminRoutes = require("./modules/admin/admin.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const authRoutes = require("./modules/auth/auth.routes");
const adminStreamRoutes = require("./modules/admin/admin.stream.routes");

function buildCorsOptions(origin, callback) {
  const list = (env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  if (list.length === 0) {
    return callback(null, true);
  }
  if (!origin || list.includes(origin)) {
    return callback(null, true);
  }
  const err = new Error("Not allowed by CORS");
  return callback(err);
}

const app = express();
app.use(requestId());
app.use(requestLogger());
app.use(helmet());
app.use(cors({ origin: buildCorsOptions, credentials: true }));
app.use(express.json());
app.use(globalLimiter);

app.get("/health", async (req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  let dbOk = true;
  try {
    await pool.query("SELECT 1");
  } catch (e) {
    dbOk = false;
  }
  const body = { ok: dbOk, service: "admin_backend", uptimeSec, requestId: req.requestId, db: { ok: dbOk } };
  if (!dbOk) return res.status(503).json(body);
  return res.json(body);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authLimiter, authRoutes);
app.use("/admin", auth, requireAnyRole(["admin", "dept_admin", "staff"]), adminRoutes);
app.use("/analytics", auth, analyticsRoutes);
app.use("/stream/admin", auth, requireAnyRole(["admin", "dept_admin", "staff"]), adminStreamRoutes);

app.use(errorHandler);

module.exports = app;
