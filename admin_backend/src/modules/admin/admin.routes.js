const express = require("express");
const { ping } = require("./admin.controller");
const staffRoutes = require("../staff/staff.routes");
const auditRoutes = require("../audit/audit.routes");
const departmentsRoutes = require("./departments.routes");
const ticketsRoutes = require("./tickets.routes");
const sessionsRoutes = require("../sessions/sessions.routes");

const router = express.Router();

router.get("/ping", ping);
router.use("/staff", staffRoutes);
router.use("/audit", auditRoutes);
router.use("/departments", departmentsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/sessions", sessionsRoutes);

module.exports = router;
