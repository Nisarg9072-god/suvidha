const asyncHandler = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/errors");
const { query } = require("../../config/db");

const listSessions = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT s.id, s.user_id, u.role, s.issued_at, s.expires_at, s.revoked, s.revoked_by, s.revoked_at
     FROM user_sessions s
     LEFT JOIN users u ON u.id = s.user_id
     ORDER BY s.issued_at DESC
     LIMIT 200`
  );
  res.json({ ok: true, items: rows });
});

const revokeSession = asyncHandler(async (req, res) => {
  const sid = parseInt(req.params.id, 10);
  const { rows } = await query(`SELECT id, user_id, revoked FROM user_sessions WHERE id=$1`, [sid]);
  if (rows.length === 0) throw new ApiError("Not Found", 404, "NOT_FOUND");
  if (rows[0].revoked) {
    return res.json({ ok: true });
  }
  await query(`UPDATE user_sessions SET revoked=TRUE, revoked_by=$1, revoked_at=NOW() WHERE id=$2`, [req.user.id, sid]);
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
       VALUES ($1, 'token_revoked', 'Session revoked', 'Your session has been revoked by admin', 'token', $2)`,
      [rows[0].user_id, sid]
    );
  } catch (e) {}
  res.json({ ok: true });
});

module.exports = { listSessions, revokeSession };
