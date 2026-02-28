const fetch = global.fetch || require('node-fetch');

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: txt }; }
}

async function main() {
  const phone = process.argv[2] || '9999999999';
  try {
    const req = await postJson('http://localhost:5000/auth/request-otp', { phone });
    if (req.status !== 200) {
      console.error('request-otp failed:', req.status, req.body);
      process.exitCode = 1;
      return;
    }
    const otp = req.body?.otp;
    if (!otp) {
      console.error('no otp returned; ensure DEMO_OTP=true and SMS_PROVIDER=mock');
      process.exitCode = 1;
      return;
    }
    const ver = await postJson('http://localhost:5000/auth/verify-otp', { phone, otp });
    if (ver.status !== 200) {
      console.error('verify-otp failed:', ver.status, ver.body);
      process.exitCode = 1;
      return;
    }
    const token = ver.body?.token;
    if (!token) {
      console.error('no token in verify response');
      process.exitCode = 1;
      return;
    }
    console.log(token);
  } catch (e) {
    console.error('get-token error:', e.message);
    process.exitCode = 1;
  }
}

main();
