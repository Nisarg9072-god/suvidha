const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

// groups by ~0.01 degree grid (tunable)
router.get("/analytics/hotspots", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const { departmentCode, serviceType, status } = req.query;

    const params = [];
    const where = ["latitude IS NOT NULL", "longitude IS NOT NULL"];

    if (departmentCode) {
      params.push(departmentCode);
      where.push(`department_id = (SELECT id FROM departments WHERE code=$${params.length})`);
    }
    if (serviceType) {
      params.push(serviceType);
      where.push(`service_type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    const r = await pool.query(
      `
      SELECT 
        ROUND(latitude::numeric, 2) AS lat_bucket, 
        ROUND(longitude::numeric, 2) AS lon_bucket, 
        COUNT(*)::int AS count 
      FROM tickets 
      WHERE ${where.join(" AND ")} 
      GROUP BY lat_bucket, lon_bucket 
      ORDER BY count DESC 
      LIMIT 200
      `,
      params
    );

    res.json({ hotspots: r.rows });
  } catch (e) { next(e); }
});

module.exports = router;

