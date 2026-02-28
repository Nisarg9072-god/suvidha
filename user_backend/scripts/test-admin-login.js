const fetch = global.fetch || require('node-fetch');

async function postJson(url, body, token) {
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

async function getJson(url, token) {
  const r = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

async function main() {
  const phone = process.argv[2] || '9999999999';
  const otp = process.argv[3] || '123456';
  try {
    const req = await postJson('http://localhost:5000/auth/request-otp', { phone });
    console.log('request-otp:', req.status, req.body);
    const ver = await postJson('http://localhost:5000/auth/verify-otp', { phone, otp });
    console.log('verify-otp:', ver.status, typeof ver.body === 'string' ? ver.body.slice(0,200) : ver.body);
    const token = ver.body?.token;
    if (!token) {
      console.error('no token from verify-otp');
      process.exitCode = 1;
      return;
    }
    const me = await getJson('http://localhost:5001/auth/me', token);
    console.log('admin /auth/me:', me.status, me.body);
  } catch (e) {
    console.error('test-admin-login error:', e.message);
    process.exitCode = 1;
  }
}

main();
