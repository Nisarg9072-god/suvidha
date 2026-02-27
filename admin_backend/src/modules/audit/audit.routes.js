const express = require("express");
const { getAudit, getLogs } = require("./audit.controller");
const auth = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");

const router = express.Router();

router.get("/", auth, authorize(PERMISSIONS.AUDIT_VIEW), getAudit);
router.get("/logs", auth, authorize(PERMISSIONS.AUDIT_VIEW), getLogs);

module.exports = router;
