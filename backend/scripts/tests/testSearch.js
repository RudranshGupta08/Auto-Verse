import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import { getCarDetails }
from "../../services/searchService.js";

await mongoose.connect(
  process.env.MONGO_URI
);

const car =
await getCarDetails("Brezza");

console.log(car);

process.exit();