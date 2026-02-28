UPDATE users SET role='admin' WHERE phone='9999999999';
UPDATE user_sessions
SET revoked=true, revoked_at=NOW()
WHERE user_id = (SELECT id FROM users WHERE phone='9999999999')
  AND revoked=false;
