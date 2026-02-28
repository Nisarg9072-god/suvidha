-- List tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;

-- List indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname='public'
ORDER BY tablename, indexname;

-- List sequences
SELECT sequence_name
FROM information_schema.sequences
WHERE sequence_schema='public'
ORDER BY sequence_name;

-- Foreign keys
SELECT conname AS constraint_name,
       conrelid::regclass AS table_name,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype='f'
ORDER BY conrelid::regclass::text, conname;

-- Row count per table (psql meta command executes generated SQL)
SELECT format('SELECT ''%I'' AS table_name, COUNT(*) AS row_count FROM %I;', table_name, table_name)
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;
\gexec
