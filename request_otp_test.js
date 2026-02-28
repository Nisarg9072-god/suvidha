(async () => {
  try {
    const res = await fetch('http://localhost:5000/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999' })
    });
    console.log('status:', res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error('error:', e.message);
    process.exitCode = 1;
  }
})();
