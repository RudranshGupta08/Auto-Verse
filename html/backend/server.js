import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import carRoutes from './routes/carRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve images
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// ✅ API routes
app.use('/api/cars', carRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send('🚗 Car API running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
