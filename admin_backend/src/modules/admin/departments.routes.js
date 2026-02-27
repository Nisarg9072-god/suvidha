const express = require("express");
const { getDepartments } = require("./departments.controller");
const { requireAnyRole } = require("../../middlewares/roleGuard");

const router = express.Router();

router.get("/", requireAnyRole(["admin", "dept_admin", "staff"]), getDepartments);

module.exports = router;
