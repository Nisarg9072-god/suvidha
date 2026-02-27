const express = require("express");
const { addClient, removeClient, safeWrite } = require("./admin.stream");
const { sseLimiter } = require("../../middlewares/rateLimit");

const router = express.Router();

router.get("/tickets", sseLimiter, (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.write("retry: 3000\n");
    const clientId = addClient(res, req.user);
    safeWrite(res, "connected", { ok: true, clientId, role: req.user.role, department_id: req.user.department_id || null, ts: Date.now() });
    const hb = setInterval(() => {
      safeWrite(res, "heartbeat", { ts: Date.now() });
    }, 25000);
    req.on("close", () => {
      clearInterval(hb);
      removeClient(clientId);
    });
  } catch (e) {
    try { res.end(); } catch (_) {}
  }
});

module.exports = router;
