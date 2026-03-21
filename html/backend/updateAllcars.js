import mongoose from "mongoose";
import Car from "./models/car.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const cars = await Car.find();
  for (let car of cars) {
    if (!car.bestFor) car.bestFor = [];
    if (!car.verdict) car.verdict = "";
    await car.save();
  }
  console.log("✅ Existing cars fixed for bestFor & verdict");
  process.exit();
});