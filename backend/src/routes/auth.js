const express = require("express");
const { pool } = require("../db");
const { signToken } = require("../utils/jwt");
const { audit } = require("../utils/audit");
const { normalizeMobile, generateOtp, hashOtp } = require("../utils/otp");
const { getSmsProvider } = require("../utils/sms");

const router = express.Router();
const { authLimiter } = require("../middleware/rateLimit");
const smsProvider = getSmsProvider();

/**
 * POST /auth/otp/request
 * { "mobile": "9999999999" }
 */
router.post("/otp/request", authLimiter, async (req, res, next) => {
  try {
    let { mobile, phone } = req.body || {};
    mobile = mobile || phone; // Support both for compatibility
    
    const normalized = normalizeMobile(mobile);
    if (!normalized) {
      return res.status(400).json({ error: "invalid mobile number (10 digits required)" });
    }

    const now = new Date();
    
    // Rate limiting: Max 3 requests per mobile per 10 minutes
    const existing = await pool.query("SELECT * FROM otps WHERE mobile = $1", [normalized]);
    
    if (existing.rowCount > 0) {
      const row = existing.rows[0];
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
      
      if (row.last_request_at && row.last_request_at > tenMinsAgo) {
        if (row.request_count >= 3) {
          return res.status(429).json({ error: "too many OTP requests. try again in 10 minutes." });
        }
        await pool.query(
          "UPDATE otps SET request_count = request_count + 1, last_request_at = $1 WHERE mobile = $2",
          [now, normalized]
        );
      } else {
        await pool.query(
          "UPDATE otps SET request_count = 1, last_request_at = $1 WHERE mobile = $2",
          [now, normalized]
        );
      }
    } else {
      await pool.query(
        "INSERT INTO otps (mobile, otp_hash, expires_at, request_count, last_request_at) VALUES ($1, $2, $3, $4, $5)",
        [normalized, "placeholder", now, 1, now]
      );
    }

    const otp = generateOtp(); // Returns string
    const otpHash = hashOtp(otp); // Hashes string
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes TTL

    await pool.query(
      "UPDATE otps SET otp_hash = $1, expires_at = $2, attempts = 0, verified_at = NULL, created_at = $3 WHERE mobile = $4",
      [otpHash, expiresAt, now, normalized]
    );

    const isProd = process.env.NODE_ENV === "production";
    const isDemo = process.env.DEMO_OTP === "true";

    // Attempt to send SMS
    try {
      await smsProvider.sendSms(normalized, `Your SUVIDHA OTP is ${otp}. Valid for 5 minutes.`);
    } catch (smsError) {
      console.error("[SMS Provider Error]", smsError.message);
    }

    const response = { ok: true, message: "OTP sent successfully" };
    
    // Safety: Never return OTP in response in production
    if (!isProd && (isDemo || process.env.SMS_PROVIDER === "mock")) {
      response.otp = otp;
      console.log(`[OTP DEBUG] For ${normalized}: ${otp}`);
    }

    res.json(response);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /auth/otp/verify
 * { "mobile": "9999999999", "otp": "123456" }
 */
router.post("/otp/verify", authLimiter, async (req, res, next) => {
  try {
    let { mobile, phone, otp } = req.body || {};
    mobile = mobile || phone;

    const normalized = normalizeMobile(mobile);
    if (!normalized || !otp) {
      return res.status(400).json({ error: "mobile and otp required" });
    }

    const resOtp = await pool.query("SELECT * FROM otps WHERE mobile = $1", [normalized]);
    if (resOtp.rowCount === 0) {
      return res.status(400).json({ error: "otp not requested" });
    }

    const row = resOtp.rows[0];
    const now = new Date();

    // Prevent reuse / Check if already consumed
    if (row.verified_at) {
      return res.status(400).json({ error: "otp already verified. please request a new one." });
    }

    // Check expiry (5 min TTL)
    if (now > row.expires_at) {
      return res.status(410).json({ error: "otp expired" });
    }

    // Max 5 verification attempts
    if (row.attempts >= 5) {
      return res.status(429).json({ error: "too many failed attempts. please request a new OTP." });
    }

    const hashedInput = hashOtp(otp.toString());
    if (hashedInput !== row.otp_hash) {
      await pool.query("UPDATE otps SET attempts = attempts + 1 WHERE mobile = $1", [normalized]);
      return res.status(401).json({ error: "wrong otp" });
    }

    // Success: Mark as consumed
    await pool.query("UPDATE otps SET verified_at = $1 WHERE mobile = $2", [now, normalized]);

    // Check/Create user
    let userRes = await pool.query(
      "SELECT id, phone, role, name, preferred_language, consent_accepted FROM users WHERE phone = $1",
      [normalized]
    );
    let user = userRes.rows[0];

    if (!user) {
      const newUser = await pool.query(
        "INSERT INTO users (phone, name, role) VALUES ($1, $2, 'citizen') RETURNING id, phone, role, name, preferred_language, consent_accepted",
        [normalized, req.body.name || null]
      );
      user = newUser.rows[0];
    }

    // Issue JWT
    const token = signToken({ id: user.id, phone: user.phone, role: user.role });
    
    try {
      await audit(req, { 
        action: "login", 
        entityType: "user", 
        entityId: user.id, 
        meta: { phone: user.phone } 
      });
    } catch {}

    res.json({ ok: true, token, user });
  } catch (e) {
    next(e);
  }
});

// Alias for compatibility with old routes
router.post("/request-otp", (req, res, next) => {
  req.url = "/otp/request";
  router.handle(req, res, next);
});

router.post("/verify-otp", (req, res, next) => {
  req.url = "/otp/verify";
  router.handle(req, res, next);
});

module.exports = router;
