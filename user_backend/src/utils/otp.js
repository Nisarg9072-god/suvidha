const crypto = require("crypto");

/**
 * Normalizes mobile numbers to E.164 format for India (+91XXXXXXXXXX).
 * - If 10 digits provided (e.g. 9988776655), adds +91.
 * - If +91 already present, keeps as-is if 10 digits follow.
 * - Rejects anything else.
 */
function normalizeMobile(mobile) {
  if (!mobile) return null;
  let cleaned = mobile.toString().replace(/\s+/g, "").replace(/-/g, "").trim();
  
  // If already starts with +91, check if 10 digits follow
  if (cleaned.startsWith("+91")) {
    const digits = cleaned.substring(3);
    return /^\d{10}$/.test(digits) ? cleaned : null;
  }

  // If starts with 91 but no +, and has 12 digits, treat as 91XXXXXXXXXX
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    const digits = cleaned.substring(2);
    return /^\d{10}$/.test(digits) ? `+91${digits}` : null;
  }
  
  // If 10 digits provided, add +91
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  return null;
}

/**
 * Generates a 6-digit OTP.
 * Random 6-digit unless DEMO_OTP is true and SMS_PROVIDER is mock.
 */
function generateOtp() {
  const isDemo = process.env.DEMO_OTP === "true";
  const isMock = process.env.SMS_PROVIDER === "mock" || !process.env.SMS_PROVIDER;

  if (isDemo && isMock) {
    return "123456";
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hashes OTP using SHA-256.
 */
function hashOtp(otp) {
  if (!otp) return null;
  return crypto.createHash("sha256").update(otp.toString()).digest("hex");
}

module.exports = {
  normalizeMobile,
  generateOtp,
  hashOtp
};
