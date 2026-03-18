import mongoose, { model } from 'mongoose';
import dotenv from 'dotenv';
import Car from './models/car.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const carsToUpdate = [
  {
    model: "Fronx",
    images: [

      "fronx/fronx-exterior-1.jpg",
      "fronx/fronx-exterior-2.jpg",
      "fronx/fronx-exterior-3.jpg",
      "fronx/fronx-exterior-4.jpg",
      "fronx/fronx-exterior-5.jpg",
      "fronx/fronx-exterior-6.jpg",
      "fronx/fronx-exterior-7.jpg"      
    ]
  }
];

async function updateImages() {
  try {
    for (const car of carsToUpdate) {
      const result = await Car.updateOne(
        { model: car.model },
        { $push: { images: { $each: car.images } } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated images for ${car.model}`);
      } else {
        console.log(`ℹ️ No changes for ${car.model} (already updated?)`);
      }
    }
  } catch (err) {
    console.error('❌ Error updating images:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔹 All done!');
  }
}

updateImages();
