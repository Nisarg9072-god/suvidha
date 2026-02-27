const { query } = require("../../config/db");

async function ping() {
  return { ok: true, scope: "admin" };
}

async function listAudit() {
  return [];
}

async function listStaff() {
  return [];
}

module.exports = { ping, listAudit, listStaff };
