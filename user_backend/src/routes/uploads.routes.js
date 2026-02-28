const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { audit } = require("../utils/audit");

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname)}`;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "application/pdf"
    ]);
    if (!allowed.has(file.mimetype)) return cb(new Error("Invalid file type"));
    cb(null, true);
  }
});

router.post("/tickets/:id/attachments", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const ticket = await db.query("SELECT id, user_id FROM tickets WHERE id=$1", [ticketId]);
    if (ticket.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });
    const t = ticket.rows[0];
    if (req.user.role !== "admin" && String(t.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.file) return res.status(400).json({ error: "file is required (multipart/form-data)" });
    const inserted = await db.query(
      `INSERT INTO ticket_attachments
        (ticket_id, uploaded_by, original_name, stored_name, mime_type, size_bytes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, ticket_id, original_name, mime_type, size_bytes, created_at`,
      [ticketId, req.user.id, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size]
    );
    try {
      await audit(req, {
        action: "attachment_upload",
        entityType: "ticket",
        entityId: Number(ticketId),
        meta: { attachmentId: inserted.rows[0].id, mime: req.file.mimetype, size: req.file.size }
      });
    } catch {}
    res.status(201).json({ attachment: inserted.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/tickets/:id/attachments", requireAuth, async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const ticket = await db.query("SELECT id, user_id FROM tickets WHERE id=$1", [ticketId]);
    if (ticket.rowCount === 0) return res.status(404).json({ error: "Ticket not found" });
    const t = ticket.rows[0];
    if (req.user.role !== "admin" && String(t.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const rows = await db.query(
      `SELECT id, original_name, mime_type, size_bytes, created_at
       FROM ticket_attachments
       WHERE ticket_id=$1
       ORDER BY created_at DESC`,
      [ticketId]
    );
    res.json({ attachments: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.get("/attachments/:attachmentId/download", requireAuth, async (req, res, next) => {
  try {
    const attachmentId = req.params.attachmentId;
    const a = await db.query(
      `SELECT ta.*, t.user_id AS ticket_owner
       FROM ticket_attachments ta
       JOIN tickets t ON t.id = ta.ticket_id
       WHERE ta.id=$1`,
      [attachmentId]
    );
    if (a.rowCount === 0) return res.status(404).json({ error: "Not found" });
    const row = a.rows[0];
    if (req.user.role !== "admin" && String(row.ticket_owner) !== String(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const filePath = path.join(UPLOAD_DIR, row.stored_name);
    if (!filePath.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: "Invalid file path" });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing on server" });
    return res.download(filePath, row.original_name);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
