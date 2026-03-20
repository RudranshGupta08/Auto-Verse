import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 ROUTES
import carRoutes from "./routes/carRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config({ path: "./.env" });

const app = express();

// =========================
// 🔥 FIX __dirname (ES MODULE)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🔥 MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// 🔥 STATIC FOLDER (IMAGES)
// =========================
app.use("/images", express.static(path.join(__dirname, "images")));

// =========================
// 🔥 ROUTES
// =========================
app.use("/api/cars", carRoutes);  // car APIs
app.use("/", authRoutes);         // login/signup

// =========================
// 🔥 ROOT ROUTE (OPTIONAL)
// =========================
app.get("/", (req, res) => {
  res.send("🚗 AutoVerse API Running...");
});

// =========================
// 🔥 DATABASE CONNECTION
// =========================
mongoose.connect(process.env.MONGO_URI)
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