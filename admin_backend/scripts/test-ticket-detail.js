const fetch = global.fetch || require('node-fetch');

async function fetchJson(url, token) {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

async function main() {
  const id = process.argv[2] || '1';
  const token = process.argv[3] || '';
  if (!token) {
    console.error('token required');
    process.exit(1);
  }
  try {
    const r = await fetchJson(`http://localhost:5001/admin/tickets/${id}`, token);
    console.log('detail:', r.status, typeof r.body === 'string' ? r.body.slice(0, 200) : r.body);
  } catch (e) {
    console.error('test-ticket-detail error:', e.message);
    process.exit(1);
  }
}

main();
