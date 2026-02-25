-- AUDIT LOGS 
CREATE TABLE IF NOT EXISTS audit_logs ( 
  id BIGSERIAL PRIMARY KEY, 
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, 
  actor_role TEXT, 
  action TEXT NOT NULL,                  -- login, ticket_create, status_update, assign, upload, payment, bill_generate, etc 
  entity_type TEXT,                      -- ticket, payment, bill, attachment, user 
  entity_id BIGINT, 
  ip TEXT, 
  user_agent TEXT, 
  meta JSONB NOT NULL DEFAULT '{}'::jsonb, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
); 

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id); 
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id); 
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action); 
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at); 

-- NOTIFICATIONS 
CREATE TABLE IF NOT EXISTS notifications ( 
  id BIGSERIAL PRIMARY KEY, 
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  type TEXT NOT NULL,              -- ticket_status, ticket_assigned, payment_success, sla_overdue 
  title TEXT NOT NULL, 
  message TEXT NOT NULL, 
  entity_type TEXT, 
  entity_id BIGINT, 
  is_read BOOLEAN NOT NULL DEFAULT FALSE, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
); 

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC); 

