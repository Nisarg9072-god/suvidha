const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const env = require("./config/env");
const { query } = require("./config/db");
const redisBus = require("./modules/admin/admin.redis");
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
const debugRoutes = require("./modules/admin/debug.routes");
const systemDebugRoutes = require("./modules/admin/system.debug.js");
const { getClientCount } = require("./modules/admin/admin.stream");
const runtime = require("./state/runtime");
const metrics = require("./utils/metrics");
const { register } = require("./utils/metrics");
const compression = require("compression");

function buildCorsOptions(origin, callback) {
  const list = (env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  if (list.length === 0) {
    return callback(null, true);
  }
  if (list.includes("*")) {
    return callback(null, true);
  }
  if (!origin || list.includes(origin)) {
    return callback(null, true);
  }
  const err = new Error("Not allowed by CORS");
  return callback(err);
}

const app = express();
app.set("trust proxy", 1);
app.use(requestId());
app.use(requestLogger());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    const path = req.originalUrl || "";
    if (path.startsWith("/stream/admin")) return false;
    const accept = req.headers["accept"] || "";
    if (String(accept).includes("text/event-stream")) return false;
    return compression.filter(req, res);
  }
}));
app.use(cors({ origin: buildCorsOptions, credentials: true }));
app.options("*", cors({ origin: buildCorsOptions, credentials: true }));
app.use((req, res, next) => {
  try { res.setHeader("X-Instance-Id", runtime.getInstanceId()); } catch (e) {}
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  const path = req.path || req.originalUrl || "";
  if (path === "/live" || path === "/ready" || path === "/metrics") return next();
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    try {
      const end = process.hrtime.bigint();
      const durationMs = Number((end - start) / BigInt(1_000_000));
      metrics.markRequest(req.method, req.path || path, res.statusCode, durationMs);
    } catch (e) {}
  });
  next();
});
app.use(globalLimiter);

app.get("/health", async (req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  let dbOk = true;
  try {
    await query("SELECT 1");
  } catch (e) {
    dbOk = false;
  }
  const body = { ok: dbOk, service: "admin_backend", uptimeSec, requestId: req.requestId, db: { ok: dbOk } };
  if (!dbOk) return res.status(503).json(body);
  return res.json(body);
});

app.get("/live", (req, res) => {
  res.json({ ok: true, service: "admin_backend", requestId: req.requestId });
});

app.get("/ready", async (req, res) => {
  if (runtime.getShuttingDown()) {
    return res.status(503).json({ ok: false, service: "admin_backend", requestId: req.requestId, db: { ok: true } });
  }
  let dbOk = true;
  try { await query("SELECT 1"); } catch (_) { dbOk = false; }
  let redisOk = true;
  try {
    if (redisBus && typeof redisBus.isEnabled === "function" && redisBus.isEnabled()) {
      redisOk = typeof redisBus.isHealthy === "function" ? redisBus.isHealthy() : true;
    }
  } catch (e) {
    redisOk = false;
  }
  const body = { ok: dbOk && redisOk, service: "admin_backend", requestId: req.requestId, db: { ok: dbOk }, redis: { ok: redisOk } };
  if (!dbOk) return res.status(503).json(body);
  if (!redisOk) return res.status(503).json(body);
  return res.json(body);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authLimiter, authRoutes);
app.use("/admin", auth, requireAnyRole(["admin", "dept_admin", "staff"]), adminRoutes);
app.use("/analytics", auth, analyticsRoutes);
app.use("/stream/admin", auth, requireAnyRole(["admin", "dept_admin", "staff"]), adminStreamRoutes);
app.use("/debug", auth, requireAnyRole(["admin"]), debugRoutes);
app.use(systemDebugRoutes);

app.get("/metrics", auth, requireAnyRole(["admin"]), async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    const content = await register.metrics();
    res.send(content);
  } catch (e) {
    res.status(500).send("# metrics error");
  }
});

app.get("/metrics-lite", auth, requireAnyRole(["admin"]), async (req, res) => {
  const mem = process.memoryUsage();
  const uptimeSec = Math.floor(process.uptime());
  const body = {
    ok: true,
    service: "admin_backend",
    requestId: req.requestId,
    uptimeSec,
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal
    },
    activeSseClients: getClientCount(),
    nodeVersion: process.version
  };
  res.json(body);
});

app.use(errorHandler);

module.exports = app;
