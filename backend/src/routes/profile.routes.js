const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const r = await db.query(
      "SELECT id, phone, role, preferred_language, consent_accepted, consent_accepted_at FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json({ user: r.rows[0] });
  } catch (e) { next(e); }
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { preferredLanguage, consentAccepted } = req.body || {};
    const upd = await db.query(
      `UPDATE users 
       SET preferred_language = COALESCE($1, preferred_language), 
           consent_accepted = COALESCE($2, consent_accepted), 
           consent_accepted_at = CASE WHEN $2=TRUE AND consent_accepted=FALSE THEN NOW() ELSE consent_accepted_at END 
       WHERE id=$3 
       RETURNING id, phone, role, preferred_language, consent_accepted, consent_accepted_at`,
      [preferredLanguage || null, typeof consentAccepted === "boolean" ? consentAccepted : null, req.user.id]
    );
    res.json({ user: upd.rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;

