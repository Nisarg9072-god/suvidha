const express = require("express");
const { getStaff } = require("./staff.controller");
const auth = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");

const router = express.Router();

router.get("/", auth, authorize(PERMISSIONS.STAFF_LIST_VIEW), getStaff);

module.exports = router;
