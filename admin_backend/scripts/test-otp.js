async function main() {
  try {
    const res = await fetch('http://localhost:5000/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999' })
    });
    const text = await res.text();
    console.log('status:', res.status);
    console.log('body:', text);
  } catch (e) {
    console.error('request error:', e.message);
    process.exitCode = 1;
  }
}
main();
