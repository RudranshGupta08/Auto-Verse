import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 ROUTES
import carRoutes from "./routes/carRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// =========================
// 🔥 FIX __dirname (ES MODULE)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🔥 MIDDLEWARE
// =========================
app.use(cors({
  origin: "*", // allow all (for dev)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// 🔥 STATIC FOLDER (VERY IMPORTANT)
// =========================
app.use("/images", express.static(path.join(__dirname, "images")));

// 👉 DEBUG ROUTE (to check images folder)
app.get("/test-images", (req, res) => {
  res.sendFile(path.join(__dirname, "images"));
});

// =========================
// 🔥 ROUTES
// =========================
app.use("/api/cars", carRoutes);
app.use("/api/auth", authRoutes); // 🔥 FIXED (better route prefix)

// =========================
// 🔥 ROOT ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("🚗 AutoVerse API Running...");
});

// =========================
// 🔥 DATABASE CONNECTION
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