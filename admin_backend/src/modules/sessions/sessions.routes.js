const express = require("express");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");
const { listSessions, revokeSession } = require("./sessions.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/", auth, authorize(PERMISSIONS.ADMIN_ONLY), listSessions);
router.patch("/:id/revoke", auth, authorize(PERMISSIONS.ADMIN_ONLY), revokeSession);

module.exports = router;
