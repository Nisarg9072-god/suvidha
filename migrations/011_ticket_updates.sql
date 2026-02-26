CREATE TABLE IF NOT EXISTS ticket_updates (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  updated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_updates_ticket ON ticket_updates(ticket_id);

