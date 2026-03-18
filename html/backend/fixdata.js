import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from './models/car.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

async function fixData() {
  try {
    const cars = await Car.find();

    for (let car of cars) {

      // ✅ Fix seatingCapacity
      if (typeof car.seatingCapacity === "string") {
        const num = parseInt(car.seatingCapacity);
        car.seatingCapacity = isNaN(num) ? 5 : num;
      }

      // ✅ Fix images (split if needed)
      if (car.images.length === 1 && car.images[0].includes(",")) {
        car.images = car.images[0].split(",").map(img => img.trim());
      }

      // ✅ Fix wrong model name
      if (car.model === "Victoris") {
        car.model = "Invicto";
      }

      await car.save();
      console.log(`✅ Fixed: ${car.model}`);
    }

    console.log("🚀 All data fixed");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

fixData();