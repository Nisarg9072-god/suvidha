# SUVIDHA Backend (Hackathon Demo) 

SUVIDHA = Smart Urban Virtual Interactive Digital Helpdesk Assistant 

## Quick Start (Docker) 
```bash 
docker compose up -d --build 
Health Check 
curl http://localhost:5000/health 
Seed Demo Data 
docker compose exec suvidha_backend node scripts/seed.js 
Demo Summary 
curl http://localhost:5000/demo/summary 
Swagger Docs 

Open: 
http://localhost:5000/docs 

Demo Flow (2 minutes) 
Citizen 

Request OTP: 

curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{"phone":"9000000001"}' 

Verify OTP (mock 123456) → get JWT: 

curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{"phone":"9000000001","otp":"123456"}' 

Create Ticket: 

curl -X POST http://localhost:5000/tickets -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"title":"Road pothole","description":"Large pothole near main gate."}' 

Upload Attachment: 

curl -X POST http://localhost:5000/tickets/<TICKET_ID>/attachments -H "Authorization: Bearer <JWT>" -F "file=@sample.pdf" 

Listen SSE: 

curl -N -H "Authorization: Bearer <JWT>" http://localhost:5000/stream/tickets/<TICKET_ID> 
Admin 

OTP + JWT using admin phone: 9999999999 

Update Status: 

curl -X PATCH http://localhost:5000/admin/tickets/<TICKET_ID>/status -H "Authorization: Bearer <ADMIN_JWT>" -H "Content-Type: application/json" -d '{"status":"IN_PROGRESS","note":"Assigned to field team"}' 
Payment 

Create mock payment: 

curl -X POST http://localhost:5000/payments/mock -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"amount":199.5,"purpose":"Water Bill"}' 

Download receipt: 

curl -L -H "Authorization: Bearer <JWT>" http://localhost:5000/payments/<PAYMENT_ID>/receipt.pdf -o receipt.pdf 

--- 

## 4.2 Add an automated demo runner (one command) 

This script will: 
- Seed data (optional) 
- Login citizen + admin (OTP mock) 
- Create a ticket 
- Upload attachment 
- Start SSE listener (prints events) 
- Admin updates status 
- Create payment 
- Download receipt 

### 1) Install tiny deps 
```powershell 
docker compose exec suvidha_backend npm i axios form-data 
2) Create file: backend/scripts/demoFlow.js 

Paste: 

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
 
### 3) Run demoFlow 
 
From host PowerShell: 
 
```powershell 
docker compose exec suvidha_backend node scripts/demoFlow.js 
``` 
 
### 4.3 Fix your PowerShell “&&” issue (FYI) 
 
In PowerShell use ; not &&. 
 
Example: 
 
```powershell 
docker compose restart suvidha_backend; docker compose logs -n 50 suvidha_backend
``` 
 
## PowerShell Tips 
 
- Do not paste two curl commands on the same line. Use two lines or separate with ; 
- Keep JSON payloads quoted with single quotes around -d 
 
Examples (OTP with ; between commands): 
 
Citizen 
```powershell 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000001\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000001\",\"otp\":\"123456\"}' 
``` 
 
Admin 
```powershell 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9999999999\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9999999999\",\"otp\":\"123456\"}' 
``` 
 
Staff 
```powershell 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000009\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000009\",\"otp\":\"123456\"}' 
``` 
 
## Final Run Order (PowerShell) 
 
Step A — Confirm staff user exists + get staff id 
```powershell 
docker compose exec -T db psql -U suvidha -d suvidha_db -c "INSERT INTO users (phone, role, created_at) VALUES ('9000000009','staff',NOW()) ON CONFLICT DO NOTHING;"; 
docker compose exec -T db psql -U suvidha -d suvidha_db -c "SELECT id, phone, role FROM users ORDER BY id;" 
``` 
admin = 9999999999 | citizen = 9000000001 | staff = 9000000009 
 
Step B — Get JWTs (3 tokens) 
```powershell 
# Citizen 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000001\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000001\",\"otp\":\"123456\"}' 
 
# Admin 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9999999999\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9999999999\",\"otp\":\"123456\"}' 
 
# Staff 
curl -X POST http://localhost:5000/auth/request-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000009\"}'; 
curl -X POST http://localhost:5000/auth/verify-otp -H "Content-Type: application/json" -d '{\"phone\":\"9000000009\",\"otp\":\"123456\"}' 
``` 
Copy each token from responses. 
 
Step C — Create Emergency Gas Ticket (Citizen JWT) 
```powershell 
curl -X POST http://localhost:5000/tickets ` 
  -H "Authorization: Bearer <CITIZEN_JWT>" ` 
  -H "Content-Type: application/json" ` 
  -d '{\"title\":\"Gas leakage near home\",\"description\":\"Strong smell and hissing sound\",\"departmentCode\":\"GAS\",\"serviceType\":\"LEAKAGE\",\"priority\":\"EMERGENCY\",\"area\":\"Sector 21\",\"latitude\":23.215,\"longitude\":72.636}' 
``` 
Save ticket.id from the response. 
 
Step D — Assign Ticket to Staff (Admin JWT) 
```powershell 
curl -X PATCH http://localhost:5000/admin/tickets/<TICKET_ID>/assign ` 
  -H "Authorization: Bearer <ADMIN_JWT>" ` 
  -H "Content-Type: application/json" ` 
  -d '{\"staffUserId\":<STAFF_ID>}' 
``` 
 
Step E — Staff sees assigned tickets 
```powershell 
curl -H "Authorization: Bearer <STAFF_JWT>" http://localhost:5000/staff/tickets 
``` 
 
Step F — Analytics 
```powershell 
curl -H "Authorization: Bearer <ADMIN_JWT>" http://localhost:5000/analytics/overview; 
curl -H "Authorization: Bearer <ADMIN_JWT>" http://localhost:5000/analytics/areas 
``` 
 
Step G — Bills + Payment History 
```powershell 
# Admin generate 
curl -X POST http://localhost:5000/admin/bills/mock-generate ` 
  -H "Authorization: Bearer <ADMIN_JWT>" ` 
  -H "Content-Type: application/json" ` 
  -d '{\"userId\":2,\"departmentCode\":\"ELEC\",\"billType\":\"ELEC_BILL\",\"amount\":349.75}' 
 
# Citizen view 
curl -H "Authorization: Bearer <CITIZEN_JWT>" http://localhost:5000/bills 
 
# Citizen pay 
curl -X POST http://localhost:5000/payments/mock ` 
  -H "Authorization: Bearer <CITIZEN_JWT>" ` 
  -H "Content-Type: application/json" ` 
  -d '{\"amount\":349.75,\"purpose\":\"Electricity Bill Payment\",\"billId\":<BILL_ID>}' 
``` 

