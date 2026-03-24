import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 ROUTES
import carRoutes from "./routes/carRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// =========================
// 🔥 FIX __dirname
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🔥 MIDDLEWARE
// =========================
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// 🔥 STATIC
// =========================
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/test-images", (req, res) => {
  res.sendFile(path.join(__dirname, "images"));
});

// =========================
// 🔥 ROUTES
// =========================
app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// =========================
// 🔥 ROOT
// =========================
app.get("/", (req, res) => {
  res.send("🚗 AutoVerse API Running...");
});

// =========================
// 🔥 DB CONNECT
// =========================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB Connected");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

})
.catch(err => {
  console.error("❌ MongoDB Error:", err);
});