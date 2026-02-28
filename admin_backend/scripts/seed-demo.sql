-- Departments (safe idempotent inserts)
INSERT INTO departments (code, name)
SELECT 'GAS', 'Gas'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code='GAS');
INSERT INTO departments (code, name)
SELECT 'ELEC', 'Electricity'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code='ELEC');
INSERT INTO departments (code, name)
SELECT 'MUNI', 'Municipal'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code='MUNI');

-- Staff users
INSERT INTO users (name, phone, role)
SELECT 'Asha Worker', '+919000000001', 'staff'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone='+919000000001');
INSERT INTO users (name, phone, role)
SELECT 'Field Engineer', '+919000000002', 'staff'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone='+919000000002');

-- Tickets (open, in_progress, resolved)
INSERT INTO tickets (user_id, department_id, category, priority, title, description, status, assigned_to, created_at)
SELECT (SELECT id FROM users WHERE phone='+919999999999'),
       (SELECT id FROM departments WHERE code='GAS'),
       'leak', 'high', 'Gas leak near market', 'Reported strong gas smell', 'open', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE title='Gas leak near market');
INSERT INTO tickets (user_id, department_id, category, priority, title, description, status, assigned_to, created_at)
SELECT (SELECT id FROM users WHERE phone='+919999999999'),
       (SELECT id FROM departments WHERE code='ELEC'),
       'outage', 'MED', 'Power outage sector 12', 'Transformer issue suspected', 'in_progress',
       (SELECT id FROM users WHERE phone='+919000000001'), NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE title='Power outage sector 12');
INSERT INTO tickets (user_id, department_id, category, priority, title, description, status, assigned_to, created_at)
SELECT (SELECT id FROM users WHERE phone='+919999999999'),
       (SELECT id FROM departments WHERE code='MUNI'),
       'road', 'low', 'Pothole fixed', 'Road maintenance completed', 'resolved',
       (SELECT id FROM users WHERE phone='+919000000002'), NOW() - INTERVAL '2 day'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE title='Pothole fixed');

-- Admin audit logs
INSERT INTO admin_audit_logs (actor_id, action, entity, ip)
SELECT (SELECT id FROM users WHERE phone='+919999999999'), 'TICKET_STATUS_UPDATED', 'ticket:2', '127.0.0.1'
WHERE NOT EXISTS (SELECT 1 FROM admin_audit_logs WHERE action='TICKET_STATUS_UPDATED' AND entity='ticket:2');
INSERT INTO admin_audit_logs (actor_id, action, entity, ip)
SELECT (SELECT id FROM users WHERE phone='+919999999999'), 'ANALYTICS_VIEWED', 'dashboard', '127.0.0.1'
WHERE NOT EXISTS (SELECT 1 FROM admin_audit_logs WHERE action='ANALYTICS_VIEWED' AND entity='dashboard');
