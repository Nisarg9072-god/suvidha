const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/bill-types", async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT bt.code, bt.name, d.code as department_code 
       FROM bill_types bt 
       JOIN departments d ON d.id=bt.department_id 
       WHERE bt.is_active=TRUE 
       ORDER BY bt.code`
    );
    res.json({ billTypes: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

