const fetch = global.fetch || require('node-fetch');

async function post(url, body, token) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

async function main() {
  const phone = process.argv[2] || '9999999999';
  const otp = process.argv[3] || '123456';
  const title = process.argv[4] || `DEV_TEST_${Date.now()}`;
  const description = process.argv[5] || 'DevOps validation ticket';
  try {
    const req = await post('http://localhost:5000/auth/request-otp', { phone });
    if (req.status !== 200) { console.error('request-otp failed', req); process.exit(1); }
    const ver = await post('http://localhost:5000/auth/verify-otp', { phone, otp });
    if (ver.status !== 200 || !ver.body?.token) { console.error('verify-otp failed', ver); process.exit(1); }
    const token = ver.body.token;
    const create = await post('http://localhost:5000/tickets', {
      title,
      description,
      departmentCode: 'GAS',
      priority: 'MED',
      area: 'validation'
    }, token);
    console.log('create-ticket:', create.status, create.body);
    const id = create.body?.ticket?.id;
    if (!id) {
      console.error('no ticket id returned');
      process.exit(1);
    }
    console.log(String(id));
  } catch (e) {
    console.error('api-create-ticket error:', e.message);
    process.exit(1);
  }
}

main();
