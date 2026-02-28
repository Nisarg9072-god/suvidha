const fs = require('fs');
const path = require('path');
const dumpPath = path.join(__dirname, '..', '..', 'full_backup.sql');

function grep(content, pattern) {
  const re = new RegExp(pattern, 'g');
  const matches = content.match(re);
  return matches ? matches.length : 0;
}

try {
  const content = fs.readFileSync(dumpPath, 'utf8');
  const size = fs.statSync(dumpPath).size;
  const stats = {
    size,
    sample: content.slice(0, 500),
    createTable: grep(content, /CREATE TABLE/),
    insertInto: grep(content, /INSERT INTO/),
    createIndex: grep(content, /CREATE INDEX|CREATE UNIQUE INDEX/),
    alterTable: grep(content, /ALTER TABLE/),
    alterSequence: grep(content, /ALTER SEQUENCE|SELECT pg_catalog.setval/)
  };
  console.log(JSON.stringify(stats, null, 2));
} catch (e) {
  console.error('validate-dump error:', e.message);
  process.exitCode = 1;
}
