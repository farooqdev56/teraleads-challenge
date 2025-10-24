
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { initDB } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import appointmentRoutes from "./routes/appointments.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
  })
);

app.get("/", (req, res) => res.json({ message: "Backend OK" }));

const printRoutes = (appInstance) => {
  const routes = [];
  const stack = appInstance._router?.stack || [];
  stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(",").toUpperCase();
      routes.push(`${methods} ${middleware.route.path}`);
    } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(",").toUpperCase();
          routes.push(`${methods} ${handler.route.path}`);
        }
      });
    }
  });
  console.log("=== Registered routes (may not show mount prefixes) ===");
  routes.forEach((r) => console.log(r));
  console.log("=======================================================");
};

const start = async () => {
  try {
    const db = await initDB();

    app.use("/api/auth", authRoutes(db));
    app.use("/api/chat", chatRoutes(db));
    app.use("/api/appointments", appointmentRoutes(db));

    printRoutes(app);

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
