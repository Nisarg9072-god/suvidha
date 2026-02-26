const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const authRoutes = require("./routes/auth");
const ticketsRoutes = require("./routes/tickets");
const adminRoutes = require("./routes/admin");
const streamRoutes = require("./routes/stream.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const paymentsRoutes = require("./routes/payments.routes");
const helmet = require("helmet");
const httpLogger = require("./middleware/logging");
const { globalLimiter } = require("./middleware/rateLimit");
const demoRoutes = require("./routes/demo.routes");
const departmentsRoutes = require("./routes/departments.routes");
const staffRoutes = require("./routes/staff.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const billsRoutes = require("./routes/bills.routes");
const auditRoutes = require("./routes/audit.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const slaRoutes = require("./routes/sla.routes");
const hotspotsRoutes = require("./routes/hotspots.routes");
const opsRoutes = require("./routes/ops.routes");
const offlineRoutes = require("./routes/offline.routes");
const profileRoutes = require("./routes/profile.routes");
const workOrdersRoutes = require("./routes/workorders.routes");
const billTypesRoutes = require("./routes/billtypes.routes");
const deptAdminRoutes = require("./routes/deptadmin.routes");
const servicesRoutes = require("./routes/services.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();
app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(helmet());
app.use(globalLimiter);

app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ status: "ok", db: "connected", time: r.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "fail", db: "not connected", error: err.message });
  }
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/admin", adminRoutes);
app.use("/stream", streamRoutes);
app.use(uploadsRoutes);
app.use("/", paymentsRoutes);
app.use("/demo", demoRoutes);
app.use("/", departmentsRoutes);
app.use("/", staffRoutes);
app.use("/", analyticsRoutes);
app.use("/", billsRoutes);
app.use("/", auditRoutes);
app.use("/", notificationsRoutes);
app.use("/", slaRoutes);
app.use("/", hotspotsRoutes);
app.use("/", opsRoutes);
app.use("/", offlineRoutes);
app.use("/", profileRoutes);
app.use("/", workOrdersRoutes);
app.use("/", billTypesRoutes);
app.use("/", deptAdminRoutes);
app.use("/", servicesRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
