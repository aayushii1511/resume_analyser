import "./env.js"; // ← MUST be first, loads .env before anything else

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[${req.method}] ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("Backend API Running"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime().toFixed(1) + "s",
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// ─── Start Express FIRST ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log("GEMINI KEY:", process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ MISSING");
});

// Prevent connection leaks
server.keepAliveTimeout = 30000;
server.headersTimeout = 35000;

// ─── Connect MongoDB (non-blocking) ───────────────────────────
const connectDB = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env");
      }

      console.log(`⏳ Connecting to MongoDB (attempt ${i}/${retries})...`);

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,  // increased to 15s
        socketTimeoutMS: 45000,
        connectTimeoutMS: 20000,          // increased to 20s
        maxPoolSize: 10,
      });

      console.log("✅ MongoDB Connected:", mongoose.connection.host);
      return; // success, stop retrying

    } catch (err) {
      console.error(`❌ Attempt ${i} failed:`, err.message);
      if (i < retries) {
        console.log(`🔄 Retrying in 3 seconds...`);
        await new Promise(res => setTimeout(res, 3000));
      } else {
        console.error("❌ All MongoDB connection attempts failed. Server still running.");
      }
    }
  }
};

connectDB();

// ─── Mongoose Event Listeners ─────────────────────────────────
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected")
);
mongoose.connection.on("reconnected", () =>
  console.log("🔄 MongoDB reconnected")
);

// ─── Graceful Shutdown ────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});