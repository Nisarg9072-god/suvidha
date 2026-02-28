(async () => {
  try {
    const req = await fetch('http://localhost:5000/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999' })
    });
    const jr = await req.json();
    console.log('request:', jr);
    if (!jr.otp) {
      console.log('No OTP in response; ensure DEMO_OTP=true or SMS_PROVIDER=mock');
      process.exit(1);
    }
    const ver = await fetch('http://localhost:5000/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999', otp: jr.otp })
    });
    console.log('verify status:', ver.status);
    const jv = await ver.text();
    console.log('verify body:', jv);
  } catch (e) {
    console.error('error:', e.message);
    process.exitCode = 1;
  }
})();
