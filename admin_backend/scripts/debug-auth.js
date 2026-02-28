/* Minimal debug script to verify dual-backend auth */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:5001";
const phone = process.argv[2] || "9999999999";

async function fetchJson(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const txt = await r.text();
  try {
    return { status: r.status, body: JSON.parse(txt) };
  } catch {
    return { status: r.status, body: txt };
  }
}

async function main() {
  console.log("Backend:", BACKEND_URL, "Admin:", ADMIN_URL, "Phone:", phone);
  const req = await fetchJson(`${BACKEND_URL}/auth/otp/request`, {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  console.log("request-otp:", req.status, req.body);
  if (req.status !== 200) {
    console.error("Request OTP failed");
    process.exit(1);
    return;
  }
  const otp = req.body?.otp;
  if (!otp) {
    console.error("No OTP in response; enable mock SMS or non-prod mode");
    process.exit(1);
    return;
  }
  const ver = await fetchJson(`${BACKEND_URL}/auth/otp/verify`, {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
  console.log("verify-otp:", ver.status, ver.body);
  if (ver.status !== 200) {
    console.error("Verify OTP failed");
    process.exit(1);
    return;
  }
  const token = ver.body?.token;
  console.log("token payload preview:", typeof token === "string" ? token.slice(0, 40) + "..." : token);
  console.log("user:", ver.body?.user);
  const me = await fetchJson(`${ADMIN_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("admin /auth/me:", me.status, me.body);
  if (me.status !== 200) {
    console.error("Admin /auth/me failed — check JWT_SECRET alignment");
    process.exit(2);
  }
  console.log("OK");
}

main().catch((e) => {
  console.error("debug error:", e);
  process.exit(1);
});
