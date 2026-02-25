-- WORK ORDERS (field team workflow) 
CREATE TABLE IF NOT EXISTS work_orders ( 
  id BIGSERIAL PRIMARY KEY, 
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, 
  assigned_staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL, 
  status TEXT NOT NULL DEFAULT 'assigned',  -- assigned/visited/fixed/cannot_fix 
  notes TEXT, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
); 

CREATE INDEX IF NOT EXISTS idx_work_orders_ticket ON work_orders(ticket_id); 
CREATE INDEX IF NOT EXISTS idx_work_orders_staff ON work_orders(assigned_staff_id); 

-- OFFLINE QUEUE (kiosk offline sync) 
CREATE TABLE IF NOT EXISTS offline_queue ( 
  id BIGSERIAL PRIMARY KEY, 
  kiosk_id TEXT NOT NULL, 
  payload JSONB NOT NULL, 
  status TEXT NOT NULL DEFAULT 'pending',  -- pending/processed/failed 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
  processed_at TIMESTAMPTZ 
); 

CREATE INDEX IF NOT EXISTS idx_offline_kiosk ON offline_queue(kiosk_id, created_at DESC); 
CREATE INDEX IF NOT EXISTS idx_offline_status ON offline_queue(status); 

