import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import {
  recommendCars
} from "../../services/recommendationService.js";

await mongoose.connect(
  process.env.MONGO_URI
);

const cars =
await recommendCars({
  bodyType: "SUV",
  maxPrice: 2000000
});

console.log(
  cars.map(car => ({
    brand: car.brand,
    model: car.model,
    minPrice: car.minPrice
  }))
);

process.exit();