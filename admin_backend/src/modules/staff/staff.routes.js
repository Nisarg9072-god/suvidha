const express = require("express");
const { getStaff, addStaff } = require("./staff.controller");
const auth = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");

const router = express.Router();

router.get("/", auth, authorize(PERMISSIONS.STAFF_LIST_VIEW), getStaff);
router.post("/", auth, authorize(PERMISSIONS.ADMIN_ONLY), addStaff);

module.exports = router;
