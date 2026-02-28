const env = require("../../config/env");
const logger = require("../../utils/logger");
let enabled = env.ADMIN_SSE_DISTRIBUTED === "true";
let pub = null;
let sub = null;
let healthy = false;

async function init() {
  if (!enabled) return { enabled: false };
  const { createClient } = require("redis");
  try {
    pub = createClient({ url: env.REDIS_URL });
    sub = createClient({ url: env.REDIS_URL });
    pub.on("error", (e) => { healthy = false; try { logger.warn("redis_pub_error", { msg: e?.message }); } catch {} });
    sub.on("error", (e) => { healthy = false; try { logger.warn("redis_sub_error", { msg: e?.message }); } catch {} });
    await pub.connect();
    await sub.connect();
    healthy = true;
    try { logger.info("redis_connected", { url: env.REDIS_URL ? "set" : "unset" }); } catch {}
    await sub.subscribe("admin_events", (message) => {
      try {
        const evt = JSON.parse(message);
        if (onEventCb) onEventCb(evt.type, evt.payload);
      } catch (e) {}
    });
    return { enabled: true };
  } catch (e) {
    healthy = false;
    try { logger.warn("redis_connect_failed", { msg: e?.message }); } catch {}
    return { enabled: false, error: e?.message };
  }
}

function isEnabled() { return enabled; }
function isHealthy() { return healthy; }

let onEventCb = null;
function onAdminEvent(cb) { onEventCb = cb; }

async function publishAdminEvent(type, payload) {
  if (!enabled || !pub || !healthy) return false;
  try {
    await pub.publish("admin_events", JSON.stringify({ type, payload }));
    return true;
  } catch (e) {
    healthy = false;
    try { logger.warn("redis_publish_failed", { msg: e?.message }); } catch {}
    return false;
  }
}

async function close() {
  try {
    if (sub) {
      try { await sub.unsubscribe("admin_events"); } catch (_) {}
    }
    if (pub) {
      try { await pub.quit(); } catch (_) {}
    }
    if (sub) {
      try { await sub.quit(); } catch (_) {}
    }
  } catch (e) {
    try { logger.warn("redis_close_error", { msg: e?.message }); } catch (_) {}
  } finally {
    healthy = false;
  }
}

module.exports = { init, isEnabled, isHealthy, onAdminEvent, publishAdminEvent, close };
