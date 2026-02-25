const jwt = require("jsonwebtoken");
const fs = require("fs");
const { Readable } = require("stream");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

async function postPayment(token, body) {
  const res = await fetch("http://localhost:5000/payments/mock", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /payments/mock failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function downloadReceipt(token, id, outPath) {
  const res = await fetch(`http://localhost:5000/payments/${id}/receipt.pdf`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /payments/${id}/receipt.pdf failed: ${res.status} ${text}`);
  }
  const file = fs.createWriteStream(outPath);
  await streamPipeline(Readable.fromWeb(res.body), file);
}

async function main() {
  // obtain JWT via OTP flow to ensure compatibility
  await fetch("http://localhost:5000/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9999999999", name: "Test User" })
  });
  const v = await fetch("http://localhost:5000/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9999999999", otp: "123456" })
  });
  const vr = await v.json();
  fs.writeFileSync("/app/test-verify.json", JSON.stringify(vr, null, 2));
  const token = vr.token;

  let payment;
  try {
    payment = await postPayment(token, { amount: 199.5, purpose: "Water Bill", ticketId: 1 });
  } catch (e) {
    payment = await postPayment(token, { amount: 199.5, purpose: "Water Bill" });
  }

  fs.writeFileSync("/app/test-payment.json", JSON.stringify(payment, null, 2));
  const id = payment.payment.id;
  const outPath = "/app/receipt.pdf";
  await downloadReceipt(token, id, outPath);
  console.log("Receipt saved to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
