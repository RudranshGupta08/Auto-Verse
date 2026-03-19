import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import carRoutes from "./routes/carRoutes.js";

dotenv.config({ path: "./.env" });

const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve images folder (IMPORTANT)
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
app.use("/api/cars", carRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  })
  .catch(err => console.log("❌ DB Error:", err));