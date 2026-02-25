const db = require("../db");

async function notify(userId, { type, title, message, entityType = null, entityId = null }) {
  await db.query(
    `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id) 
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, type, title, message, entityType, entityId]
  );
}

module.exports = { notify };

