const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

function signToken(payload) {
  if (!SECRET && (process.env.NODE_ENV || "development") === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return jwt.sign(payload, SECRET, { expiresIn: "2h" });
}

function verifyToken(token) {
  if (!SECRET && (process.env.NODE_ENV || "development") === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };