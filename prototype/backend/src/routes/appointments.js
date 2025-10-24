
import express from "express";
import { authMiddleware } from "../middleware/auth.js";

export default (db) => {
  const router = express.Router();

  router.post("/", authMiddleware, async (req, res) => {
    const { patient_name, patient_phone, scheduled_at } = req.body;
    const user_id = req.user.id;
    if (!patient_name || !scheduled_at) return res.status(400).json({ message: "patient_name and scheduled_at required" });
    try {
      const result = await db.run(
        `INSERT INTO appointments (user_id, patient_name, patient_phone, scheduled_at, status) VALUES (?, ?, ?, ?, 'pending')`,
        [user_id, patient_name, patient_phone || null, scheduled_at]
      );
      res.json({ id: result.lastID, message: "Appointment created" });
    } catch (err) {
      console.error("appointment err:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/", authMiddleware, async (req, res) => {
    try {
      const rows = await db.all(`SELECT * FROM appointments WHERE user_id = ? ORDER BY scheduled_at DESC`, [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
