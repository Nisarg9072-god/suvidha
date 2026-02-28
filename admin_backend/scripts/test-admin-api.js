const token = process.argv[2] || '';

async function fetchJson(url, opts={}) {
  const r = await fetch(url, opts);
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

(async () => {
  try {
    const live = await fetchJson('http://localhost:5001/live');
    console.log('live:', live.status, live.body);
    const ready = await fetchJson('http://localhost:5001/ready');
    console.log('ready:', ready.status, ready.body);
    if (!token) {
      console.log('no token provided, skipping protected checks');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const me = await fetchJson('http://localhost:5001/auth/me', { headers });
    console.log('me:', me.status, me.body);
    const tickets = await fetchJson('http://localhost:5001/admin/tickets', { headers });
    console.log('tickets:', tickets.status, typeof tickets.body === 'string' ? tickets.body.slice(0,200) : tickets.body);
  } catch (e) {
    console.error('test error:', e.message);
    process.exitCode = 1;
  }
})();
