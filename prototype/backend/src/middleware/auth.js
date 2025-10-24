
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-key";

export const createToken = (payload, expiresIn = "15m") => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
