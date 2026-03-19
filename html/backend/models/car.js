import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  type: String,

  priceRange: String,
  engineOptions: [String],
  mileage: String,

  fuelType: [String],
  transmission: [String],

  seatingCapacity: Number, // 🔥 FIXED (should be Number, not String)
  images: [String],

  // 🔥 NEW FIELDS FOR REAL CONTENT
  description: String,
  features: [String],
  pros: [String],
  cons: [String]

}, { timestamps: true }); // optional but recommended

export default mongoose.model("Car", carSchema);