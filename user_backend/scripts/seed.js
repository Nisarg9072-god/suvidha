const db = require("../src/db");

async function ensureUser({ phone, role, name }) {
  const existing = await db.query("SELECT id, phone, role FROM users WHERE phone=$1", [phone]);
  if (existing.rowCount) return existing.rows[0];
  const inserted = await db.query(
    `INSERT INTO users (phone, role, name, created_at)
     VALUES ($1,$2,$3,NOW())
     RETURNING id, phone, role`,
    [phone, role, name || null]
  );
  return inserted.rows[0];
}

async function createTicket({ userId, title, description, status = "open" }) {
  const inserted = await db.query(
    `INSERT INTO tickets (user_id, title, description, status, created_at)
     VALUES ($1,$2,$3,$4,NOW())
     RETURNING id, user_id, status`,
    [userId, title, description, status]
  );
  return inserted.rows[0];
}

async function addUpdate({ ticketId, byUserId, status, note }) {
  await db.query(
    `INSERT INTO ticket_updates (ticket_id, status, note, updated_by)
     VALUES ($1,$2,$3,$4)`,
    [ticketId, status, note || null, byUserId]
  );
}

async function createPayment({ userId, ticketId, amountPaise, purpose }) {
  const receiptNo = `SEED-${Date.now()}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
  const inserted = await db.query(
    `INSERT INTO payments (user_id, ticket_id, amount_paise, purpose, receipt_no)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, receipt_no`,
    [userId, ticketId || null, amountPaise, purpose, receiptNo]
  );
  return inserted.rows[0];
}

async function main() {
  console.log("🌱 Seeding SUVIDHA demo data...");
  const admin = await ensureUser({ phone: "9999999999", role: "admin", name: "Admin Demo" });
  const c1 = await ensureUser({ phone: "9000000001", role: "citizen", name: "Citizen One" });
  const c2 = await ensureUser({ phone: "9000000002", role: "citizen", name: "Citizen Two" });

  const t1 = await createTicket({
    userId: c1.id,
    title: "Streetlight not working near Sector 21",
    description: "Streetlight has been off for 3 days. Area is unsafe at night.",
    status: "open"
  });
  const t2 = await createTicket({
    userId: c1.id,
    title: "Garbage not collected in my lane",
    description: "Garbage truck missed collection twice this week.",
    status: "in_progress"
  });
  const t3 = await createTicket({
    userId: c2.id,
    title: "Water leakage on main road",
    description: "Continuous water leakage causing traffic and wastage.",
    status: "open"
  });

  await addUpdate({ ticketId: t2.id, byUserId: admin.id, status: "assigned", note: "Assigned to sanitation team." });
  await addUpdate({ ticketId: t2.id, byUserId: admin.id, status: "in_progress", note: "Team scheduled visit today 5 PM." });
  await addUpdate({ ticketId: t1.id, byUserId: admin.id, status: "assigned", note: "Electrical team will inspect tomorrow morning." });

  const pay = await createPayment({
    userId: c1.id,
    ticketId: null,
    amountPaise: 19950,
    purpose: "Water Bill (Mock)"
  });

  console.log("✅ Seed complete:");
  console.log("Admin:", admin);
  console.log("Citizen1:", c1);
  console.log("Citizen2:", c2);
  console.log("Tickets:", { t1, t2, t3 });
  console.log("Payment:", pay);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
