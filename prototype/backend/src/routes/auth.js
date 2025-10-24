
import express from "express";
import bcrypt from "bcryptjs";
import { createToken } from "../middleware/auth.js";

export default (db) => {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const hash = await bcrypt.hash(password, 10);
    try {
      const result = await db.run(
        `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
        [email, hash, name || null]
      );
      const userId = result.lastID;
      res.json({ id: userId, message: "user created" });
    } catch (err) {
      console.error("register err:", err);
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    try {
      const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
      if (!user) return res.status(404).json({ message: "user not found" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "invalid credentials" });

      const token = createToken({ id: user.id, email: user.email }, "1h");
      res.json({ token });
    } catch (err) {
      console.error("login err:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
