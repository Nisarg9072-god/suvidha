CREATE TABLE IF NOT EXISTS bills (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  bill_type TEXT NOT NULL,            -- GAS_BILL / ELEC_BILL / PROPERTY_TAX
  amount_paise BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DUE', -- DUE/PAID
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_department_id ON bills(department_id);

-- Link payments to bills
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bill_id BIGINT REFERENCES bills(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);

