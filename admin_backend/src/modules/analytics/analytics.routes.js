const express = require("express");
const { overview, areas, hotspots } = require("./analytics.controller");
const auth = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");
const { analyticsLimiter } = require("../../middlewares/rateLimit");
const { validateAnalyticsQuery } = require("../../utils/validate");

const router = express.Router();

router.get("/overview", auth, analyticsLimiter, validateAnalyticsQuery, authorize(PERMISSIONS.ANALYTICS_VIEW), overview);
router.get("/areas", auth, analyticsLimiter, validateAnalyticsQuery, authorize(PERMISSIONS.ANALYTICS_VIEW), areas);
router.get("/hotspots", auth, analyticsLimiter, validateAnalyticsQuery, authorize(PERMISSIONS.ANALYTICS_VIEW), hotspots);

module.exports = router;
