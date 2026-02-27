const express = require("express");
const { authorize } = require("../../middlewares/authorize");
const { PERMISSIONS } = require("../../config/permissions");
const auth = require("../../middlewares/auth");
const ctrl = require("./tickets.controller");
const { writeLimiter } = require("../../middlewares/rateLimit");
const {
  validateParamId,
  validateStatusBody,
  validateAssignBody,
  validateWorkOrderBody,
  validateUpdateBody
} = require("../../utils/validate");

const router = express.Router();

router.get("/", auth, ctrl.list);
router.get("/:id", auth, validateParamId, ctrl.detail);
router.patch("/:id/status", auth, writeLimiter, validateParamId, validateStatusBody, authorize(PERMISSIONS.TICKET_STATUS_CHANGE), ctrl.patchStatus);
router.patch("/:id/assign", auth, writeLimiter, validateParamId, validateAssignBody, authorize(PERMISSIONS.TICKET_ASSIGN), ctrl.patchAssign);
router.post("/:id/work-order", auth, writeLimiter, validateParamId, validateWorkOrderBody, authorize(PERMISSIONS.TICKET_WORK_ORDER_CREATE), ctrl.createWorkOrder);
router.get("/:id/updates", auth, validateParamId, ctrl.getUpdates);
router.post("/:id/updates", auth, writeLimiter, validateParamId, validateUpdateBody, authorize(PERMISSIONS.TICKET_UPDATE_ADD), ctrl.addUpdate);

module.exports = router;
