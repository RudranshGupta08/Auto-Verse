import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import {
  compareCars
} from "../../services/comparisonService.js";

await mongoose.connect(
  process.env.MONGO_URI
);

const result =
await compareCars(
  "Brezza",
  "Harrier"
);

console.log(result);

process.exit();