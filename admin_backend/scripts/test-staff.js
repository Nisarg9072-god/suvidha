const token = process.argv[2] || '';
const name = process.argv[3] || 'Demo Staff';
const phone = process.argv[4] || '+919000000003';
const departmentCode = process.argv[5] || 'ELEC';

async function fetchJson(url, opts={}) {
  const r = await fetch(url, opts);
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

(async () => {
  try {
    if (!token) { console.log('Usage: node scripts/test-staff.js <ADMIN_TOKEN> [name] [phone] [deptCode]'); process.exit(1); }
    const base = 'http://localhost:5001';
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const res = await fetchJson(`${base}/admin/staff`, { method: 'POST', headers, body: JSON.stringify({ name, phone, departmentCode }) });
    console.log('create staff:', res.status, res.body);
    const list = await fetchJson(`${base}/admin/staff`, { headers });
    console.log('staff list:', list.status, Array.isArray(list.body) ? list.body.slice(0,3) : list.body);
  } catch (e) {
    console.error('test-staff error:', e.message);
    process.exitCode = 1;
  }
})();
