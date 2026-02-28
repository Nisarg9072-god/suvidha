const express = require("express");
const PDFDocument = require("pdfkit");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { audit } = require("../utils/audit");
const { notify } = require("../utils/notify");

const router = express.Router();

function makeReceiptNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `SUVIDHA-${y}${m}${day}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

router.post("/payments/mock", requireAuth, async (req, res, next) => {
  try {
    const { amount, purpose, ticketId, billId } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }
    if (!purpose || typeof purpose !== "string" || purpose.length < 2) {
      return res.status(400).json({ error: "purpose is required" });
    }
    let safeTicketId = null;
    if (ticketId != null) {
      const t = await db.query("SELECT id, user_id FROM tickets WHERE id=$1", [ticketId]);
      if (t.rowCount === 0) return res.status(404).json({ error: "ticket not found" });
      if (req.user.role !== "admin" && String(t.rows[0].user_id) !== String(req.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      safeTicketId = ticketId;
    }
    let safeBillId = null;
    if (billId != null) {
      const b = await db.query("SELECT id, user_id, status FROM bills WHERE id=$1", [billId]);
      if (b.rowCount === 0) return res.status(404).json({ error: "bill not found" });
      if (req.user.role !== "admin" && String(b.rows[0].user_id) !== String(req.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      safeBillId = billId;
    }
    const receiptNo = makeReceiptNo();
    const amountPaise = Math.round(amount * 100);
    const inserted = await db.query(
      `INSERT INTO payments (user_id, ticket_id, bill_id, amount_paise, purpose, receipt_no)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, user_id, ticket_id, bill_id, amount_paise, purpose, provider, status, receipt_no, created_at`,
      [req.user.id, safeTicketId, safeBillId, amountPaise, purpose, receiptNo]
    );
    const payment = inserted.rows[0];
    if (safeBillId) {
      await db.query("UPDATE bills SET status='PAID' WHERE id=$1", [safeBillId]);
    }
    try {
      await audit(req, {
        action: "payment",
        entityType: "payment",
        entityId: payment.id,
        meta: { ticketId: safeTicketId, billId: safeBillId, amountPaise }
      });
      await notify(req.user.id, {
        type: "payment_success",
        title: "Payment successful",
        message: `Payment ${payment.receipt_no} for ₹ ${(amountPaise / 100).toFixed(2)} is successful`,
        entityType: safeBillId ? "bill" : (safeTicketId ? "ticket" : null),
        entityId: safeBillId || safeTicketId || null
      });
    } catch {}
    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
});

router.get("/payments/:id/receipt.pdf", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const p = await db.query(
      `SELECT p.*, u.phone, u.role
       FROM payments p
       JOIN users u ON u.id = p.user_id
       WHERE p.id=$1`,
      [id]
    );
    if (p.rowCount === 0) return res.status(404).json({ error: "Not found" });
    const pay = p.rows[0];
    if (req.user.role !== "admin" && String(pay.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${pay.receipt_no}.pdf"`);
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);
    doc.fontSize(18).text("SUVIDHA - Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt No: ${pay.receipt_no}`);
    doc.text(`Status: ${pay.status}`);
    doc.text(`Provider: ${pay.provider}`);
    doc.text(`Date: ${new Date(pay.created_at).toLocaleString()}`);
    doc.moveDown();
    doc.text(`Purpose: ${pay.purpose}`);
    doc.text(`Amount: ₹ ${(pay.amount_paise / 100).toFixed(2)}`);
    if (pay.ticket_id) doc.text(`Linked Ticket ID: ${pay.ticket_id}`);
    doc.moveDown();
    doc.text("Note: This is a MOCK receipt generated for hackathon demo purposes.");
    doc.end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
