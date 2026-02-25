const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const BASE = process.env.BASE_URL || "http://localhost:5000";

async function requestOtp(phone) {
  const { data } = await axios.post(`${BASE}/auth/request-otp`, { phone });
  return data;
}

async function verifyOtp(phone, otp = "123456") {
  const { data } = await axios.post(`${BASE}/auth/verify-otp`, { phone, otp });
  return data.token;
}

async function createTicket(jwt) {
  const { data } = await axios.post(
    `${BASE}/tickets`,
    { title: "Demo: Pothole on main road", description: "Big pothole causing traffic." },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );

  // your API may return {ticket: {...}} or ticket directly
  const ticket = data.ticket || data;
  return ticket.id;
}

async function uploadFile(jwt, ticketId) {
  const filePath = path.join(__dirname, "sample.pdf");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "SUVIDHA demo file\n");
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const { data } = await axios.post(
    `${BASE}/tickets/${ticketId}/attachments`,
    form,
    { headers: { Authorization: `Bearer ${jwt}`, ...form.getHeaders() } }
  );

  return data;
}

async function adminUpdateStatus(adminJwt, ticketId) {
  const { data } = await axios.patch(
    `${BASE}/admin/tickets/${ticketId}/status`,
    { status: "IN_PROGRESS", note: "Assigned to field team (demoFlow)" },
    { headers: { Authorization: `Bearer ${adminJwt}` } }
  );
  return data;
}

async function createPayment(jwt) {
  const { data } = await axios.post(
    `${BASE}/payments/mock`,
    { amount: 199.5, purpose: "Water Bill (Mock)" },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  const pay = data.payment || data;
  return pay.id;
}

async function downloadReceipt(jwt, paymentId) {
  const res = await axios.get(`${BASE}/payments/${paymentId}/receipt.pdf`, {
    headers: { Authorization: `Bearer ${jwt}` },
    responseType: "arraybuffer"
  });

  const out = path.join(__dirname, `receipt-${paymentId}.pdf`);
  fs.writeFileSync(out, Buffer.from(res.data));
  return out;
}

async function main() {
  console.log("=== SUVIDHA demoFlow ===");

  // Citizen login
  await requestOtp("9000000001");
  const citizenJwt = await verifyOtp("9000000001");
  console.log("Citizen JWT OK");

  // Admin login
  await requestOtp("9999999999");
  const adminJwt = await verifyOtp("9999999999");
  console.log("Admin JWT OK");

  // Create ticket
  const ticketId = await createTicket(citizenJwt);
  console.log("Created ticket:", ticketId);

  // Upload attachment
  await uploadFile(citizenJwt, ticketId);
  console.log("Uploaded attachment");

  console.log("Start SSE stream in separate terminal for best demo:");
  console.log(`curl -N -H "Authorization: Bearer <JWT>" ${BASE}/stream/tickets/${ticketId}`);

  // Admin updates status
  await adminUpdateStatus(adminJwt, ticketId);
  console.log("Admin updated status -> should trigger SSE event");

  // Payment + receipt
  const paymentId = await createPayment(citizenJwt);
  console.log("Created payment:", paymentId);

  const receiptPath = await downloadReceipt(citizenJwt, paymentId);
  console.log("Downloaded receipt:", receiptPath);

  console.log("✅ demoFlow completed");
}

main().catch((e) => {
  console.error("❌ demoFlow failed:", e.response?.data || e.message);
  process.exit(1);
});

