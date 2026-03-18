import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import carRoutes from './routes/carRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Fix dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/cars', carRoutes);

const PORT = process.env.PORT || 5000;

// ✅ CONNECT FIRST, THEN START SERVER
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB CONNECTED");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB ERROR:", err);
  });