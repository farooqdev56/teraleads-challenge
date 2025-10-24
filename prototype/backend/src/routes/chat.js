
import express from "express";
import axios from "axios";
import { authMiddleware } from "../middleware/auth.js";

export default (db) => {
  const router = express.Router();
  router.post("/", authMiddleware, async (req, res) => {
    const { message, session_id } = req.body;
    const userId = req.user?.id ?? null;

    try {
      const pythonResp = await axios.post(
        "http://localhost:5000/chat",
        { user_id: userId, session_id, message },
        { timeout: 5000 }
      );

      try {
        const existing = await db.get(`SELECT * FROM chat_sessions WHERE session_id = ?`, [session_id]);
        if (existing) {
          const msgs = JSON.parse(existing.messages || "[]");
          msgs.push({ role: "user", text: message, ts: new Date().toISOString() });
          msgs.push({ role: "bot", text: pythonResp.data.reply, ts: new Date().toISOString() });
          await db.run(`UPDATE chat_sessions SET messages = ?, metadata = ? WHERE id = ?`, [
            JSON.stringify(msgs),
            JSON.stringify({ last_reply: pythonResp.data.reply }),
            existing.id,
          ]);
        } else {
          const msgs = [
            { role: "user", text: message, ts: new Date().toISOString() },
            { role: "bot", text: pythonResp.data.reply, ts: new Date().toISOString() },
          ];
          await db.run(
            `INSERT INTO chat_sessions (user_id, session_id, messages, metadata) VALUES (?, ?, ?, ?)`,
            [userId, session_id || `s-${Date.now()}`, JSON.stringify(msgs), JSON.stringify({})]
          );
        }
      } catch (logErr) {
        console.warn("Could not persist chat session:", logErr);
      }

      res.json({ reply: pythonResp.data.reply });
    } catch (err) {
      console.error("chat forward err:", err.message || err);
      res.status(502).json({ error: "Chat service unavailable" });
    }
  });

  return router;
};
