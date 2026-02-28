const express = require("express");
const { getAudit, getLogs } = require("./audit.controller");
const auth = require("../../middlewares/auth");
const { requireAnyRole } = require("../../middlewares/roleGuard");

const router = express.Router();

router.get("/", auth, requireAnyRole(["admin"]), getAudit);
router.get("/logs", auth, requireAnyRole(["admin"]), getLogs);

module.exports = router;
