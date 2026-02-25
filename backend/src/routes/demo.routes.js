const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const users = await db.query("SELECT COUNT(*)::int AS count FROM users");
    const tickets = await db.query("SELECT COUNT(*)::int AS count FROM tickets");
    const statusCounts = await db.query(`
      SELECT status, COUNT(*)::int AS count
      FROM tickets
      GROUP BY status
      ORDER BY status
    `);
    const payments = await db.query("SELECT COUNT(*)::int AS count FROM payments");
    res.json({
      service: "SUVIDHA",
      serverTime: new Date().toISOString(),
      counts: {
        users: users.rows[0].count,
        tickets: tickets.rows[0].count,
        payments: payments.rows[0].count
      },
      ticketsByStatus: statusCounts.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
