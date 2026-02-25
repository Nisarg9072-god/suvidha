CREATE TABLE IF NOT EXISTS service_requests (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  service_code TEXT NOT NULL,                 -- CERT_BIRTH / CERT_DEATH
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_ticket ON service_requests(ticket_id);

