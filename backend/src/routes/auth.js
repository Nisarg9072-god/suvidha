const express = require("express");
const { pool } = require("../db");
const { signToken } = require("../utils/jwt");
const { audit } = require("../utils/audit");

const router = express.Router();

const otps = new Map();
const { authLimiter } = require("../middleware/rateLimit");

router.post("/request-otp", authLimiter, async (req, res) => {
  const { phone, name } = req.body || {};
  if (!phone) return res.status(400).json({ error: "phone required" });
  const code = "123456";
  otps.set(phone, { code, name, expiresAt: Date.now() + 5 * 60 * 1000 });
  res.json({ ok: true, otp: code });
});

router.post("/verify-otp", authLimiter, async (req, res) => {
  const { phone, otp } = req.body || {};
  if (!phone || !otp) return res.status(400).json({ error: "phone and otp required" });
  const entry = otps.get(phone);
  if (!entry) return res.status(400).json({ error: "otp not requested" });
  if (Date.now() > entry.expiresAt) return res.status(400).json({ error: "otp expired" });
  if (otp !== entry.code) return res.status(400).json({ error: "invalid otp" });

  const u1 = await pool.query("SELECT id, phone, role, name FROM users WHERE phone=$1", [phone]);
  let user = u1.rows[0];
  if (!user) {
    const name = entry.name || null;
    const u2 = await pool.query(
      "INSERT INTO users(phone, name) VALUES($1, $2) RETURNING id, phone, role, name",
      [phone, name]
    );
    user = u2.rows[0];
  }

  const token = signToken({ id: user.id, phone: user.phone, role: user.role });
  try {
    await audit(req, { action: "login", entityType: "user", entityId: user.id, meta: { phone: user.phone } });
  } catch {}
  res.json({ ok: true, token, user });
});

module.exports = router;
